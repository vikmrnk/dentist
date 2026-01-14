from django.db import transaction
from django.db.models import Count
from django.utils.dateparse import parse_date
from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError

from .models import Appointment, AppointmentStatus
from .serializers import AppointmentSerializer, AppointmentStatusSerializer
from .permissions import IsRegistrarOrAdmin


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = (
        Appointment.objects.select_related("patient", "doctor", "status")
        .all()
        .order_by("-date", "-time_start")
    )
    serializer_class = AppointmentSerializer
    permission_classes = [IsRegistrarOrAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "patient__last_name",
        "patient__first_name",
        "patient__middle_name",
        "patient__phone",
        "doctor__last_name",
    ]
    ordering_fields = ["date", "time_start", "time_end", "created_at"]
    filterset_fields = ["doctor", "patient", "date", "status"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsRegistrarOrAdmin()]

    @transaction.atomic
    def perform_create(self, serializer):
        serializer.save()

    @transaction.atomic
    def perform_update(self, serializer):
        serializer.save()


class ScheduleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        date_param = request.query_params.get("date")
        doctor_id = request.query_params.get("doctor_id")
        if not date_param:
            raise ValidationError({"date": "date is required"})
        date = parse_date(date_param)
        if not date:
            raise ValidationError({"date": "invalid date"})

        qs = Appointment.objects.select_related("patient", "doctor", "status").filter(
            date=date
        )
        if doctor_id:
            qs = qs.filter(doctor_id=doctor_id)

        serializer = AppointmentSerializer(qs, many=True)
        return Response(serializer.data)


class DailyReportMixin:
    permission_classes = [permissions.IsAuthenticated]

    def _parse_date(self, request):
        date_param = request.query_params.get("date")
        if not date_param:
            raise ValidationError({"date": "date is required"})
        date = parse_date(date_param)
        if not date:
            raise ValidationError({"date": "invalid date"})
        return date

    def _status_totals(self, qs):
        # Use a separate queryset without ordering to avoid SQL GROUP BY issues
        return qs.order_by().values("status__code").annotate(count=Count("id"))


class DailyReportView(DailyReportMixin, APIView):
    def get(self, request):
        date = self._parse_date(request)
        qs = Appointment.objects.select_related("patient", "doctor", "status").filter(
            date=date
        )
        serializer = AppointmentSerializer(qs, many=True)
        totals = self._status_totals(qs)
        return Response({"items": serializer.data, "totals": list(totals)})


class DoctorDailyReportView(DailyReportMixin, APIView):
    def get(self, request):
        date = self._parse_date(request)
        doctor_id = request.query_params.get("doctor_id")
        if not doctor_id:
            raise ValidationError({"doctor_id": "doctor_id is required"})
        qs = Appointment.objects.select_related("patient", "doctor", "status").filter(
            date=date, doctor_id=doctor_id
        )
        serializer = AppointmentSerializer(qs, many=True)
        totals = self._status_totals(qs)
        return Response({"items": serializer.data, "totals": list(totals)})


class CancelledReportView(DailyReportMixin, APIView):
    def get(self, request):
        date = self._parse_date(request)
        cancelled_status = (
            AppointmentStatus.objects.filter(code="cancelled").first()
        )
        if not cancelled_status:
            return Response(
                {"detail": "Cancelled status not configured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        qs = Appointment.objects.select_related("patient", "doctor", "status").filter(
            date=date, status=cancelled_status
        )
        serializer = AppointmentSerializer(qs, many=True)
        return Response({"items": serializer.data, "count": qs.count()})

