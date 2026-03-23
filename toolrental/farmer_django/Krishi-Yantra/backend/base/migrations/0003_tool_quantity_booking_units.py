from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("base", "0002_remove_booking_equipment_booking_tool_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="tool",
            name="quantity",
            field=models.PositiveIntegerField(
                default=1,
                help_text="How many identical units can be rented at the same time.",
            ),
        ),
        migrations.AddField(
            model_name="booking",
            name="units",
            field=models.PositiveIntegerField(
                default=1,
                help_text="Number of tool units for this booking.",
            ),
        ),
    ]
