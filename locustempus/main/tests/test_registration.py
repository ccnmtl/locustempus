"""Tests for the Custom Registration views"""
from django.contrib.auth.models import User
from django.test import TestCase
from django.urls.base import reverse


class CustomRegistrationTest(TestCase):
    def test_register(self):
        url = reverse('django_registration_register', args=[])

        # https://en.wikipedia.org/wiki/Muhammad_al-Idrisi
        data = {
            'first_name': 'Muhammad',
            'last_name': 'al-Idrisi',
            'username': 'al-idrisi',
            'email': 'alidrisi@cartographer.org',
            'password1': 'test',
            'password2': 'test'
        }

        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 302)

        user = User.objects.get(username='al-idrisi')
        self.assertEqual(user.first_name, 'Muhammad')
        self.assertEqual(user.last_name, 'al-Idrisi')
        self.assertEqual(user.email, 'alidrisi@cartographer.org')
