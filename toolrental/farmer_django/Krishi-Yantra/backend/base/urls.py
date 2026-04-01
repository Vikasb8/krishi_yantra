from django.urls import path
from . import views

urlpatterns = [
    path("", views.getRoutes, name="Routes"),
    path("tools/create/", views.create_tool, name="create-tool"),
    path("tools/<str:pk>/update/", views.update_tool, name="update-tool"),
    path("tools/", views.getTools, name="tools"),
    path("tools/<str:pk>/", views.getTool, name="tool"),
    path("tools/<str:pk>/reviews/", views.get_tool_reviews, name="tool-reviews"),
    path("reviews/average-rating/<str:pk>/", views.get_average_rating, name="average-rating"),
    path("users/mybookings/", views.get_my_bookings, name="my-bookings"),
    path("users/mytools/", views.get_my_tools, name="my-tools"),
    path("users/register/", views.register_user, name="register-user"),
    path("users/profile/", views.get_user_profile, name="user-profile"),
    path("users/myreviews/", views.get_my_reviews, name="my-reviews"),
    path("bookings/create/", views.create_booking, name="create-booking"),
    path("users/mytoolbookings/", views.get_my_tool_bookings, name="my-tool-bookings"),
    path("bookings/<str:pk>/approve/", views.approve_booking, name="booking-approve"),
    path("bookings/<str:pk>/reject/", views.reject_booking, name="booking-reject"),
    path("tools/<str:pk>/relist/", views.relist_tool, name="tool-relist"),
    path("reviews/create/", views.create_review, name="create-review"),
    path("reviews/<str:pk>/", views.update_review, name="update-review"),
    path("reviews/<str:pk>/delete/", views.delete_review, name="delete-review"),
]
