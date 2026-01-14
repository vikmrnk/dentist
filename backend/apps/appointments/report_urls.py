from django.urls import path
from .views import DailyReportView, DoctorDailyReportView, CancelledReportView

urlpatterns = [
    path("daily/", DailyReportView.as_view(), name="report-daily"),
    path("doctor-daily/", DoctorDailyReportView.as_view(), name="report-doctor-daily"),
    path("cancelled/", CancelledReportView.as_view(), name="report-cancelled"),
]

