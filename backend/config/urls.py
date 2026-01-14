from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/patients/", include("apps.patients.urls")),
    path("api/doctors/", include("apps.doctors.urls")),
    path("api/appointments/", include("apps.appointments.urls")),
    path("api/schedule/", include("apps.appointments.schedule_urls")),
    path("api/reports/", include("apps.appointments.report_urls")),
]

