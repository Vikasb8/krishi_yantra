from datetime import datetime

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User

from .models import Tool, Booking
from .serializers import ToolSerializer, BookingSerializer
from .availability import can_book_units

# Create your views here.


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user

    if request.method == "PUT":
        data = request.data
        user.first_name = data.get("name", user.first_name)
        user.username = data.get("email", user.username)
        user.email = data.get("email", user.email)

        if data.get("password"):
            user.password = make_password(data["password"])
        
        user.save()

        if hasattr(user, 'profile'):
            user.profile.phone_number = data.get("phone_number", getattr(user.profile, 'phone_number', ''))
            user.profile.address = data.get("address", getattr(user.profile, 'address', ''))
            user.profile.location = data.get("location", getattr(user.profile, 'location', ''))
            user.profile.save()

    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email or "",
            "name": user.first_name or "",
            "phone_number": getattr(user.profile, 'phone_number', '') if hasattr(user, 'profile') else '',
            "address": getattr(user.profile, 'address', '') if hasattr(user, 'profile') else '',
            "location": getattr(user.profile, 'location', '') if hasattr(user, 'profile') else '',
        }
    )


@api_view(["GET"])
def getRoutes(request):
    routes = [
        "/api/tools/",
        "/api/tools/<id>/",
        "/api/tools/create/",
        "/api/tools/<id>/update/",
        "/api/tools/upload/",
        "/api/tools/<id>/reviews/",
    ]
    return Response(routes)


@api_view(["GET"])
def getTools(request):
    tools = Tool.objects.all()
    serializer = ToolSerializer(tools, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def getTool(request, pk):
    tool = get_object_or_404(Tool, pk=pk)
    serializer = ToolSerializer(tool, many=False)
    data = dict(serializer.data)

    start_s = request.query_params.get("start")
    end_s = request.query_params.get("end")
    if start_s and end_s:
        try:
            s = datetime.strptime(start_s, "%Y-%m-%d").date()
            e = datetime.strptime(end_s, "%Y-%m-%d").date()
            data["can_book_selected_range"] = can_book_units(tool, s, e, 1)
        except ValueError:
            data["can_book_selected_range"] = False
    else:
        data["can_book_selected_range"] = None

    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_tool(request):
    serializer = ToolSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(owner=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_tool(request, pk):
    tool = get_object_or_404(Tool, pk=pk)
    if tool.owner != request.user:
        return Response(
            {"detail": "Not authorized to update this tool."},
            status=status.HTTP_403_FORBIDDEN,
        )
    partial = request.method == "PATCH"
    serializer = ToolSerializer(tool, data=request.data, partial=partial)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_booking(request):
    """
    Creates a new booking. Body: toolId, startDate, endDate (YYYY-MM-DD), optional units (default 1).
    """
    user = request.user
    data = request.data

    try:
        tool_id = data["toolId"]
        start_date_str = data["startDate"]
        end_date_str = data["endDate"]
    except KeyError:
        return Response(
            {"detail": "Missing required fields: toolId, startDate, or endDate"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    units = int(data.get("units", 1) or 1)
    if units < 1:
        return Response(
            {"detail": "units must be at least 1."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        tool = Tool.objects.get(id=tool_id)
    except Tool.DoesNotExist:
        return Response({"detail": "Tool not found."}, status=status.HTTP_404_NOT_FOUND)

    if tool.owner == user:
        return Response(
            {"detail": "You cannot book your own tool."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
    except ValueError:
        return Response(
            {"detail": "Incorrect date format. Please use YYYY-MM-DD."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if start_date < datetime.now().date():
        return Response(
            {"detail": "Start date cannot be in the past."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if start_date >= end_date:
        return Response(
            {"detail": "End date must be after the start date."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not can_book_units(tool, start_date, end_date, units):
        return Response(
            {
                "detail": "Not enough units available for the selected dates. Try other dates or reduce quantity."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    duration_in_days = (end_date - start_date).days
    total_price = duration_in_days * tool.price_per_day * units

    booking = Booking.objects.create(
        renter=user,
        tool=tool,
        start_date=start_date,
        end_date=end_date,
        units=units,
        total_price=total_price,
    )

    serializer = BookingSerializer(booking, many=False)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_my_bookings(request):
    user = request.user
    bookings = Booking.objects.filter(renter=user)
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_my_tools(request):
    user = request.user
    tools = Tool.objects.filter(owner=user)
    serializer = ToolSerializer(tools, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    try:
        user = User.objects.create(
            first_name=data["name"],
            username=data["email"],
            email=data["email"],
            password=make_password(data["password"]),
        )
        if hasattr(user, 'profile'):
            user.profile.phone_number = data.get("phone", "")
            user.profile.address = data.get("address", "")
            user.profile.save()
        return Response(
            {"detail": "User was registered successfully!"},
            status=status.HTTP_201_CREATED,
        )
    except Exception:
        return Response(
            {"detail": "User with this email already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_my_tool_bookings(request):
    user = request.user
    bookings = Booking.objects.filter(tool__owner=user)
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def approve_booking(request, pk):
    try:
        booking = Booking.objects.get(pk=pk)
        if booking.tool.owner != request.user:
            return Response(
                {"detail": "Not authorized to approve this booking."},
                status=status.HTTP_403_FORBIDDEN,
            )

        booking.status = "CONFIRMED"
        booking.save()

        serializer = BookingSerializer(booking, many=False)
        return Response(serializer.data)
    except Booking.DoesNotExist:
        return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def reject_booking(request, pk):
    try:
        booking = Booking.objects.get(pk=pk)
        if booking.tool.owner != request.user:
            return Response(
                {"detail": "Not authorized to reject this booking."},
                status=status.HTTP_403_FORBIDDEN,
            )

        booking.status = "CANCELLED"
        booking.save()

        serializer = BookingSerializer(booking, many=False)
        return Response(serializer.data)
    except Booking.DoesNotExist:
        return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)
