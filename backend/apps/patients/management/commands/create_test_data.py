from datetime import date, time, timedelta
from django.core.management.base import BaseCommand
from apps.patients.models import Patient
from apps.doctors.models import Doctor
from apps.appointments.models import Appointment, AppointmentStatus


class Command(BaseCommand):
    help = 'Створює тестові дані: пацієнтів, лікарів та записи'

    def handle(self, *args, **options):
        self.stdout.write('Створення тестових даних...')

        # Отримуємо статуси
        status_planned = AppointmentStatus.objects.get(code='planned')
        status_completed = AppointmentStatus.objects.get(code='completed')

        # Створюємо лікарів
        doctors_data = [
            {
                'first_name': 'Олександр',
                'last_name': 'Петренко',
                'middle_name': 'Володимирович',
                'specialization': 'Терапевтична стоматологія',
                'phone': '+380501234567',
            },
            {
                'first_name': 'Марія',
                'last_name': 'Коваленко',
                'middle_name': 'Іванівна',
                'specialization': 'Ортодонтія',
                'phone': '+380501234568',
            },
            {
                'first_name': 'Дмитро',
                'last_name': 'Шевченко',
                'middle_name': 'Олександрович',
                'specialization': 'Хірургічна стоматологія',
                'phone': '+380501234569',
            },
        ]

        doctors = []
        for doc_data in doctors_data:
            doctor, created = Doctor.objects.get_or_create(
                phone=doc_data['phone'],
                defaults=doc_data
            )
            doctors.append(doctor)
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Створено лікаря: {doctor}'))

        # Створюємо пацієнтів
        patients_data = [
            {
                'first_name': 'Іван',
                'last_name': 'Іваненко',
                'middle_name': 'Петрович',
                'phone': '+380501111111',
                'email': 'ivan@example.com',
                'birth_date': date(1990, 5, 15),
            },
            {
                'first_name': 'Олена',
                'last_name': 'Сидоренко',
                'middle_name': 'Миколаївна',
                'phone': '+380501111112',
                'email': 'olena@example.com',
                'birth_date': date(1985, 8, 20),
            },
            {
                'first_name': 'Петро',
                'last_name': 'Мельник',
                'middle_name': 'Олексійович',
                'phone': '+380501111113',
                'email': 'petro@example.com',
                'birth_date': date(1992, 3, 10),
            },
            {
                'first_name': 'Наталія',
                'last_name': 'Бондаренко',
                'middle_name': 'Сергіївна',
                'phone': '+380501111114',
                'email': 'natalia@example.com',
                'birth_date': date(1988, 11, 25),
            },
            {
                'first_name': 'Андрій',
                'last_name': 'Ткаченко',
                'middle_name': 'Вікторович',
                'phone': '+380501111115',
                'email': 'andriy@example.com',
                'birth_date': date(1995, 7, 5),
            },
        ]

        patients = []
        for pat_data in patients_data:
            patient, created = Patient.objects.get_or_create(
                phone=pat_data['phone'],
                defaults=pat_data
            )
            patients.append(patient)
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Створено пацієнта: {patient}'))

        # Створюємо записи на сьогодні та наступні дні
        today = date.today()
        appointments_created = 0

        # Записи на сьогодні
        today_slots = [
            (time(9, 0), time(9, 30), patients[0], doctors[0], status_planned),
            (time(10, 0), time(10, 30), patients[1], doctors[0], status_planned),
            (time(11, 0), time(11, 30), patients[2], doctors[1], status_planned),
            (time(14, 0), time(14, 30), patients[3], doctors[1], status_completed),
            (time(15, 0), time(15, 30), patients[4], doctors[2], status_planned),
        ]

        for time_start, time_end, patient, doctor, status in today_slots:
            appointment, created = Appointment.objects.get_or_create(
                patient=patient,
                doctor=doctor,
                date=today,
                time_start=time_start,
                defaults={
                    'time_end': time_end,
                    'status': status,
                    'note': 'Тестовий запис',
                }
            )
            if created:
                appointments_created += 1

        # Записи на завтра
        tomorrow = today + timedelta(days=1)
        tomorrow_slots = [
            (time(9, 0), time(9, 30), patients[0], doctors[1], status_planned),
            (time(10, 0), time(10, 30), patients[2], doctors[0], status_planned),
            (time(14, 0), time(14, 30), patients[4], doctors[2], status_planned),
        ]

        for time_start, time_end, patient, doctor, status in tomorrow_slots:
            appointment, created = Appointment.objects.get_or_create(
                patient=patient,
                doctor=doctor,
                date=tomorrow,
                time_start=time_start,
                defaults={
                    'time_end': time_end,
                    'status': status,
                    'note': 'Тестовий запис',
                }
            )
            if created:
                appointments_created += 1

        # Записи на післязавтра
        day_after = today + timedelta(days=2)
        day_after_slots = [
            (time(10, 0), time(10, 30), patients[1], doctors[2], status_planned),
            (time(11, 0), time(11, 30), patients[3], doctors[0], status_planned),
        ]

        for time_start, time_end, patient, doctor, status in day_after_slots:
            appointment, created = Appointment.objects.get_or_create(
                patient=patient,
                doctor=doctor,
                date=day_after,
                time_start=time_start,
                defaults={
                    'time_end': time_end,
                    'status': status,
                    'note': 'Тестовий запис',
                }
            )
            if created:
                appointments_created += 1

        self.stdout.write(self.style.SUCCESS(f'\n✓ Створено {appointments_created} записів'))
        self.stdout.write(self.style.SUCCESS('\n✅ Тестові дані успішно створено!'))

