from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Patient
from .serializers import PatientSerializer


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by("-created_at")
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["last_name", "first_name", "middle_name", "phone"]
    ordering_fields = ["last_name", "created_at"]

