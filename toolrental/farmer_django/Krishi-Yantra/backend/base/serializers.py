from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Avg
from .models import Tool, Booking, Review
from .availability import available_units_for_tool


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name', read_only=True)
    phone_number = serializers.CharField(source='profile.phone_number', read_only=True, default='')
    address = serializers.CharField(source='profile.address', read_only=True, default='')
    location = serializers.CharField(source='profile.location', read_only=True, default='')
    profile_image = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "name", "phone_number", "address", "location", "profile_image"]

    def get_profile_image(self, obj):
        if hasattr(obj, 'profile') and obj.profile.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile.profile_image.url)
            return obj.profile.profile_image.url
        return None


class OwnerSerializer(serializers.ModelSerializer):
    """Lightweight serializer for displaying tool owner info."""
    name = serializers.CharField(source='first_name', read_only=True)
    location = serializers.CharField(source='profile.location', read_only=True, default='')
    phone_number = serializers.CharField(source='profile.phone_number', read_only=True, default='')
    profile_image = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "name", "email", "location", "phone_number", "profile_image"]

    def get_profile_image(self, obj):
        if hasattr(obj, 'profile') and obj.profile.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile.profile_image.url)
            return obj.profile.profile_image.url
        return None


class ToolSerializer(serializers.ModelSerializer):
    available_units = serializers.SerializerMethodField(read_only=True)
    is_bookable = serializers.SerializerMethodField(read_only=True)
    average_rating = serializers.SerializerMethodField(read_only=True)
    review_count = serializers.SerializerMethodField(read_only=True)
    owner_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Tool
        fields = [
            "id",
            "owner",
            "name",
            "image",
            "category",
            "description",
            "price_per_day",
            "quantity",
            "is_available",
            "available_units",
            "is_bookable",
            "average_rating",
            "review_count",
            "owner_details",
        ]
        read_only_fields = ["owner", "available_units", "is_bookable", "average_rating", "review_count", "owner_details"]

    def get_available_units(self, obj):
        return available_units_for_tool(obj)

    def get_is_bookable(self, obj):
        return available_units_for_tool(obj) > 0

    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg is not None else 0

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_owner_details(self, obj):
        return OwnerSerializer(obj.owner, context=self.context).data


class BookingSerializer(serializers.ModelSerializer):
    tool = ToolSerializer(read_only=True)
    renter = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = (
            "id",
            "tool",
            "renter",
            "start_date",
            "end_date",
            "units",
            "total_price",
            "status",
        )


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "product",
            "user_id",
            "username",
            "first_name",
            "rating",
            "comment",
            "createdAt",
            "updated_at",
        ]
        read_only_fields = ["user", "product", "createdAt", "updated_at"]


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["rating", "comment"]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
