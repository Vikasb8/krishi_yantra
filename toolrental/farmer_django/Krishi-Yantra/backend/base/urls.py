from django.urls import path
from . import views

urlpatterns = [
    path("", views.getRoutes, name="Routes"),
    path("tools/create/", views.create_tool, name="create-tool"),
    path("tools/<str:pk>/update/", views.update_tool, name="update-tool"),
    path("tools/", views.getTools, name="tools"),
    path("tools/<str:pk>/", views.getTool, name="tool"),
    path("users/mybookings/", views.get_my_bookings, name="my-bookings"),
    path("users/mytools/", views.get_my_tools, name="my-tools"),
    path("users/register/", views.register_user, name="register-user"),
    path("users/profile/", views.get_user_profile, name="user-profile"),
    path("bookings/create/", views.create_booking, name="create-booking"),
    path("users/mytoolbookings/", views.get_my_tool_bookings, name="my-tool-bookings"),
    path("bookings/<str:pk>/approve/", views.approve_booking, name="booking-approve"),
    path("bookings/<str:pk>/reject/", views.reject_booking, name="booking-reject"),
]
