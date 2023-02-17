from django.conf import settings
from django.conf.urls import include, url
from django.contrib import admin
from django.urls import path
from django.views.generic import TemplateView
from django.views.static import serve
from django_registration.backends.activation.views import RegistrationView
from rest_framework import routers

from locustempus import design
from locustempus.main.forms import CustomRegistrationForm
from locustempus.main import views, viewsets


admin.autodiscover()


auth_urls = url(r'^accounts/', include('django.contrib.auth.urls'))
if hasattr(settings, 'CAS_BASE'):
    auth_urls = url(r'^accounts/', include('djangowind.urls'))

router = routers.DefaultRouter()
router.register(r'project', viewsets.ProjectApiView, basename='api-project')
router.register(r'activity', viewsets.ActivityApiView, basename='api-activity')
router.register(r'response', viewsets.ResponseApiView, basename='api-response')
router.register(r'feedback', viewsets.FeedbackAPIView, basename='api-feedback')
router.register(r'layer', viewsets.LayerApiView, basename='api-layer')
router.register(r'event', viewsets.EventApiView, basename='api-event')

urlpatterns = [
    path('contact/', include('contactus.urls')),
    url(r'^api/', include(router.urls)),
    path('accounts/register/',
         RegistrationView.as_view(form_class=CustomRegistrationForm),
         name='django_registration_register'),
    url(r'^accounts/',
        include('django_registration.backends.activation.urls')),
    auth_urls,
    url(r'^$', views.IndexView.as_view(), name='index-view'),
    url(r'^admin/', admin.site.urls),
    url(r'^lti/', include('lti_provider.urls')),
    url(r'^course/lti/create/$',
        views.LTICourseCreate.as_view(), name='lti-course-create'),
    url(r'^course/lti/(?P<context>\w[^/]*)/$',
        views.LTICourseSelector.as_view(), name='lti-course-select'),
    url(r'^_impersonate/', include('impersonate.urls')),
    url(r'^stats/$$', TemplateView.as_view(template_name='stats.html')),
    url(r'smoketest/', include('smoketest.urls')),
    url(r'infranil/', include('infranil.urls')),
    url(r'^uploads/(?P<path>.*)$$',
        serve, {'document_root': settings.MEDIA_ROOT}),
    url(r'^sign_s3/$', views.SignS3View.as_view()),
    url(r'^dashboard/$', views.DashboardView.as_view(),
        name='course-list-view'),
    url(r'^dashboard/profile/$', views.UserProfileView.as_view(),
        name='profile-view'),
    url(r'^course/create/$', views.CourseCreateView.as_view(),
        name='course-create-view'),
    url(r'^course/(?P<pk>\d+)/$', views.CourseDetailView.as_view(),
        name='course-detail-view'),
    url(r'^course/(?P<pk>\d+)/edit/$', views.CourseEditView.as_view(),
        name='course-edit-view'),
    url(r'^course/(?P<pk>\d+)/delete/$', views.CourseDeleteView.as_view(),
        name='course-delete-view'),
    url(r'^course/(?P<pk>\d+)/roster/$', views.CourseRosterView.as_view(),
        name='course-roster-view'),
    url(r'^course/(?P<pk>\d+)/roster/promote/$',
        views.CourseRosterPromoteView.as_view(),
        name='course-roster-promote-view'),
    url(r'^course/(?P<pk>\d+)/roster/demote/$',
        views.CourseRosterDemoteView.as_view(),
        name='course-roster-demote-view'),
    url(r'^course/(?P<pk>\d+)/roster/remove/$',
        views.CourseRosterRemoveView.as_view(),
        name='course-roster-remove-view'),
    url(r'^course/(?P<pk>\d+)/roster/resend-invite/$',
        views.CourseRosterResendEmailInviteView.as_view(),
        name='course-roster-resend-invite-view'),
    url(r'^course/(?P<pk>\d+)/roster/uninvite/$',
        views.CourseRosterUninviteView.as_view(),
        name='course-roster-uninvite-view'),
    url(r'^course/(?P<pk>\d+)/roster/invite/$',
        views.CourseRosterInviteUser.as_view(),
        name='course-roster-invite-user'),
    url(r'^course/(?P<pk>\d+)/project/create/$',
        views.ProjectCreateView.as_view(),
        name='course-project-create'),
    url(r'^course/(?P<pk>\d+)/project/(?P<project_pk>\d+)/$',
        views.ProjectView.as_view(),
        name='course-project-detail'),
    url(r'^course/(?P<pk>\d+)/project/(?P<project_pk>\d+)/delete/$',
        views.ProjectDeleteView.as_view(),
        name='course-project-delete'),
]


# Design app
urlpatterns += [
    url(r'^design/$',
        design.views.Index.as_view(),
        name='design-index'),
    url(r'^design/identity/$',
        design.views.Identity.as_view(),
        name='design-identity'),
    url(r'^design/colors/$',
        design.views.Colors.as_view(),
        name='design-colors'),
    url(r'^design/typography/$',
        design.views.Typography.as_view(),
        name='design-typography'),
    url(r'^design/components/$',
        design.views.Components.as_view(),
        name='design-components'),
]


if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        url(r'^__debug__/', include(debug_toolbar.urls)),
    ]
