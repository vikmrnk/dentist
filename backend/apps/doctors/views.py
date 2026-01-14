from rest_framework import viewsets, permissions
from .models import Doctor
from .serializers import DoctorSerializer
from apps.users.permissions import IsAdmin


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().order_by("last_name")
    serializer_class = DoctorSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

