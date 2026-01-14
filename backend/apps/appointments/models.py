from django.core.exceptions import ValidationError
from django.db import models

from apps.patients.models import Patient
from apps.doctors.models import Doctor


class AppointmentStatus(models.Model):
    code = models.CharField(max_length=32, unique=True)
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Appointment statuses"

    def __str__(self):
        return self.name


class AppointmentQuerySet(models.QuerySet):
    def for_doctor_date(self, doctor_id, date):
        return self.filter(doctor_id=doctor_id, date=date)


class Appointment(models.Model):
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name="appointments"
    )
    doctor = models.ForeignKey(
        Doctor, on_delete=models.CASCADE, related_name="appointments"
    )
    date = models.DateField()
    time_start = models.TimeField()
    time_end = models.TimeField()
    status = models.ForeignKey(
        AppointmentStatus, on_delete=models.PROTECT, related_name="appointments"
    )
    note = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = AppointmentQuerySet.as_manager()

    class Meta:
        indexes = [
            models.Index(
                fields=["doctor", "date", "time_start", "time_end"],
                name="ix_app_doctor_date",
            ),
            models.Index(fields=["patient", "date"], name="ix_app_patient_date"),
            models.Index(fields=["status", "date"], name="ix_app_status_date"),
        ]
        ordering = ["-date", "-time_start"]

    def clean(self):
        if self.time_end <= self.time_start:
            raise ValidationError("time_end must be after time_start")

        qs = Appointment.objects.for_doctor_date(self.doctor_id, self.date)
        if self.pk:
            qs = qs.exclude(pk=self.pk)

        overlap = qs.filter(
            time_start__lt=self.time_end,
            time_end__gt=self.time_start,
        ).exists()
        if overlap:
            raise ValidationError(
                "Doctor already has an overlapping appointment in this slot"
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.patient} with {self.doctor} on {self.date} {self.time_start}"

