from datetime import datetime, date

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User

from .models import Tool, Booking, Review
from .serializers import ToolSerializer, BookingSerializer, ReviewSerializer, ReviewCreateSerializer
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
            
            # Handle profile image upload
            if 'profile_image' in request.FILES:
                user.profile.profile_image = request.FILES['profile_image']
            
            user.profile.save()

    profile_image_url = None
    if hasattr(user, 'profile') and user.profile.profile_image:
        profile_image_url = request.build_absolute_uri(user.profile.profile_image.url)

    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email or "",
            "name": user.first_name or "",
            "phone_number": getattr(user.profile, 'phone_number', '') if hasattr(user, 'profile') else '',
            "address": getattr(user.profile, 'address', '') if hasattr(user, 'profile') else '',
            "location": getattr(user.profile, 'location', '') if hasattr(user, 'profile') else '',
            "profile_image": profile_image_url,
        }
    )



def expire_pending_bookings():
    today = date.today()
    Booking.objects.filter(status="PENDING", start_date__lte=today).update(status="EXPIRED")


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
    expire_pending_bookings()
    tools = Tool.objects.all()
    serializer = ToolSerializer(tools, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(["GET"])
def getTool(request, pk):
    expire_pending_bookings()
    tool = get_object_or_404(Tool, pk=pk)
    serializer = ToolSerializer(tool, many=False, context={'request': request})
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


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def relist_tool(request, pk):
    try:
        tool = Tool.objects.get(pk=pk)
    except Tool.DoesNotExist:
        return Response({"detail": "Tool not found."}, status=status.HTTP_404_NOT_FOUND)

    if tool.owner != request.user:
        return Response(
            {"detail": "Not authorized to manage this tool."},
            status=status.HTTP_403_FORBIDDEN,
        )

    requested_units = int(request.data.get("quantity", tool.quantity) or tool.quantity)
    if requested_units < 1:
        return Response(
            {"detail": "Quantity must be at least 1."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    tool.quantity = max(tool.quantity, requested_units)
    tool.save()

    serializer = ToolSerializer(tool, many=False)
    return Response(serializer.data)


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
    expire_pending_bookings()
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
    expire_pending_bookings()
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

        # Immediately refresh availability and expire past pending bookings
        expire_pending_bookings()

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


# Review Endpoints


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_review(request):
    """
    Create a review for a tool. User must have a completed booking for this tool.
    Body: toolId (int), rating (1-5), comment (optional str)
    """
    user = request.user
    data = request.data

    try:
        tool_id = data.get("toolId")
    except (KeyError, TypeError):
        return Response(
            {"detail": "toolId is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        tool = Tool.objects.get(id=tool_id)
    except Tool.DoesNotExist:
        return Response({"detail": "Tool not found."}, status=status.HTTP_404_NOT_FOUND)

    # Check if user has a confirmed or completed booking for this tool
    completed_booking = Booking.objects.filter(
        renter=user,
        tool=tool,
        status__in=["COMPLETED", "CONFIRMED"]
    ).exists()

    if not completed_booking:
        return Response(
            {"detail": "You can only review tools you have rented. Your booking must be confirmed or completed."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Create or update review
    serializer = ReviewCreateSerializer(data=request.data)
    if serializer.is_valid():
        review = serializer.save(user=user, product=tool)
        return_serializer = ReviewSerializer(review, many=False)
        return Response(return_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_tool_reviews(request, pk):
    """
    Get all reviews for a tool, paginated and sorted by most recent first.
    """
    try:
        tool = Tool.objects.get(id=pk)
    except Tool.DoesNotExist:
        return Response({"detail": "Tool not found."}, status=status.HTTP_404_NOT_FOUND)

    # Optionally add pagination
    limit = int(request.query_params.get('limit', 20))
    offset = int(request.query_params.get('offset', 0))

    reviews = tool.reviews.all()[offset : offset + limit]
    serializer = ReviewSerializer(reviews, many=True)

    return Response({
        "total": tool.reviews.count(),
        "limit": limit,
        "offset": offset,
        "results": serializer.data
    })


@api_view(["GET"])
def get_average_rating(request, pk):
    """
    Get the average rating for a tool and the review count.
    """
    try:
        tool = Tool.objects.get(id=pk)
    except Tool.DoesNotExist:
        return Response({"detail": "Tool not found."}, status=status.HTTP_404_NOT_FOUND)

    reviews = tool.reviews.all()
    if reviews.count() > 0:
        total_rating = sum(review.rating for review in reviews)
        average_rating = round(total_rating / reviews.count(), 1)
    else:
        average_rating = 0

    return Response({
        "tool_id": pk,
        "average_rating": average_rating,
        "review_count": reviews.count()
    })


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_review(request, pk):
    """
    Update a review (only by the review author).
    """
    try:
        review = Review.objects.get(id=pk)
    except Review.DoesNotExist:
        return Response({"detail": "Review not found."}, status=status.HTTP_404_NOT_FOUND)

    if review.user != request.user:
        return Response(
            {"detail": "You can only edit your own reviews."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = ReviewCreateSerializer(review, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return_serializer = ReviewSerializer(review, many=False)
        return Response(return_serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_review(request, pk):
    """
    Delete a review (only by the review author).
    """
    try:
        review = Review.objects.get(id=pk)
    except Review.DoesNotExist:
        return Response({"detail": "Review not found."}, status=status.HTTP_404_NOT_FOUND)

    if review.user != request.user:
        return Response(
            {"detail": "You can only delete your own reviews."},
            status=status.HTTP_403_FORBIDDEN,
        )

    review.delete()
    return Response({"detail": "Review deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_my_reviews(request):
    """
    Get all reviews created by the current user.
    """
    user = request.user
    reviews = Review.objects.filter(user=user)
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)
