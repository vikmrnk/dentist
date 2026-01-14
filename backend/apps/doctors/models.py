from django.db import models


class Doctor(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    specialization = models.CharField(max_length=150)
    phone = models.CharField(max_length=32, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["last_name", "first_name"], name="ix_doctor_name"),
            models.Index(fields=["specialization"], name="ix_doctor_spec"),
        ]
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"Dr. {self.last_name}"

