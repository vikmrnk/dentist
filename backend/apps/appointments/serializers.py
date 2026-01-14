from django.db import transaction
from rest_framework import serializers

from apps.patients.models import Patient
from apps.doctors.models import Doctor
from .models import Appointment, AppointmentStatus


class AppointmentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentStatus
        fields = ["id", "code", "name"]


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    status_code = serializers.SerializerMethodField()
    status_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "patient_name",
            "doctor",
            "doctor_name",
            "date",
            "time_start",
            "time_end",
            "status",
            "status_code",
            "status_name",
            "note",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "patient_name", "doctor_name", "status_code", "status_name"]

    def get_patient_name(self, obj):
        return f"{obj.patient.last_name} {obj.patient.first_name}"

    def get_doctor_name(self, obj):
        return f"{obj.doctor.last_name} {obj.doctor.first_name}"

    def get_status_code(self, obj):
        return obj.status.code if obj.status else None

    def get_status_name(self, obj):
        return obj.status.name if obj.status else None

    def validate(self, attrs):
        # Model.clean will handle overlap; keep here to allow early validation if needed.
        return super().validate(attrs)

    def _get_planned_status(self):
        return AppointmentStatus.objects.get(code="planned")

    def create(self, validated_data):
        with transaction.atomic():
            if not validated_data.get("status"):
                validated_data["status"] = self._get_planned_status()
            return super().create(validated_data)

    def update(self, instance, validated_data):
        with transaction.atomic():
            return super().update(instance, validated_data)

