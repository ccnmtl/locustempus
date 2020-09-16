from django.test import TestCase
from django.urls.base import reverse


class DesignAppViewTest(TestCase):
    def test_design_index(self):
        response = self.client.get(
            reverse('design-index')
        )
        self.assertEqual(response.status_code, 200)

    def test_design_identity(self):
        response = self.client.get(
            reverse('design-identity')
        )
        self.assertEqual(response.status_code, 200)

    def test_design_colors(self):
        response = self.client.get(
            reverse('design-colors')
        )
        self.assertEqual(response.status_code, 200)

    def test_design_typography(self):
        response = self.client.get(
            reverse('design-typography')
        )
        self.assertEqual(response.status_code, 200)

    def test_design_components(self):
        response = self.client.get(
            reverse('design-components')
        )
        self.assertEqual(response.status_code, 200)
