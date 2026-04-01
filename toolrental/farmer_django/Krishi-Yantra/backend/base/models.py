from django.db import models
from django.contrib.auth.models import User
class Tool(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    image = models.ImageField(null=True, blank=True)
    category = models.CharField(max_length=100)
    description = models.TextField()
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(
        default=1,
        help_text="How many identical units can be rented at the same time.",
    )
    is_available = models.BooleanField(default=True)
    def __str__(self):
        return self.name

class Review(models.Model):
    RATING_CHOICES = [(i, i) for i in range(1, 6)]
    
    product = models.ForeignKey(Tool, on_delete=models.CASCADE, related_name='reviews', null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews', null=True)
    rating = models.IntegerField(choices=RATING_CHOICES, default=5, help_text="Rating from 1 to 5 stars")
    comment = models.TextField(blank=True, default='')
    createdAt = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    id = models.AutoField(primary_key=True, editable=False)

    class Meta:
        ordering = ['-createdAt']
        verbose_name_plural = 'Reviews'

    def __str__(self):
        return f'{self.product.name} - {self.rating} stars by {self.user.username}'


class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    tool = models.ForeignKey(Tool, on_delete=models.CASCADE)
    renter = models.ForeignKey(User, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    units = models.PositiveIntegerField(
        default=1,
        help_text="Number of tool units for this booking.",
    )
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    is_completed = models.BooleanField(default=False, help_text="Whether the rental is completed and tool returned.")
    completion_date = models.DateTimeField(null=True, blank=True, help_text="When the rental was marked as completed.")
    
    def __str__(self):
        return f'Booking for {self.tool.name}'
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        UserProfile.objects.get_or_create(user=instance)
        instance.profile.save()
