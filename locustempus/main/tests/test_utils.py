from django.core import mail
from django.test.testcases import TestCase
from django.urls.base import reverse

from locustempus.main.tests.factories import UserFactory
from locustempus.main.utils import send_template_email


class UtilTest(TestCase):

    def test_send_template_email(self):
        user = UserFactory()
        with self.settings(SERVER_EMAIL='locustempus@example.com'):
            send_template_email('foo', 'main/notify_lti_course_connect.txt',
                                {'user': user}, 'abc123@columbia.edu')
            self.assertEqual(len(mail.outbox), 1)
            self.assertEqual(mail.outbox[0].subject, 'foo')
            self.assertEquals(mail.outbox[0].from_email,
                              'locustempus@example.com')
            self.assertTrue(mail.outbox[0].to, ['abc123@columbia.edu'])

    def test_sentry_dsn_processor(self):
        with self.settings(SENTRY_DSN='foo'):
            r = self.client.get(reverse('index-view'))
            self.assertEqual('foo', r.context['SENTRY_DSN'])
