from django.conf import settings
from django.urls import include, re_path
from django.contrib import admin
from django.urls import path
from django.views.generic import TemplateView
from django.views.static import serve
from django_registration.backends.activation.views import RegistrationView
from rest_framework import routers
from django_cas_ng import views as cas_views

from locustempus import design
from locustempus.main.forms import CustomRegistrationForm
from locustempus.main import views, viewsets


admin.autodiscover()


auth_urls = path('accounts/', include('django.contrib.auth.urls'))

router = routers.DefaultRouter()
router.register(r'project', viewsets.ProjectApiView, basename='api-project')
router.register(r'activity', viewsets.ActivityApiView, basename='api-activity')
router.register(r'response', viewsets.ResponseApiView, basename='api-response')
router.register(r'feedback', viewsets.FeedbackAPIView, basename='api-feedback')
router.register(r'layer', viewsets.LayerApiView, basename='api-layer')
router.register(r'event', viewsets.EventApiView, basename='api-event')

urlpatterns = [
    path('contact/', include('contactus.urls')),

    path('accounts/', include('django.contrib.auth.urls')),

    path('cas/login', cas_views.LoginView.as_view(),
         name='cas_ng_login'),
    path('cas/logout', cas_views.LogoutView.as_view(),
         name='cas_ng_logout'),

    path('api/', include(router.urls)),
    path('accounts/register/',
         RegistrationView.as_view(form_class=CustomRegistrationForm),
         name='django_registration_register'),
    path('accounts/',
         include('django_registration.backends.activation.urls')),
    auth_urls,
    re_path(r'^$', views.IndexView.as_view(), name='index-view'),
    path('admin/', admin.site.urls),
    path('lti/', include('lti_provider.urls')),
    re_path(r'^course/lti/create/$',
            views.LTICourseCreate.as_view(), name='lti-course-create'),
    re_path(r'^course/lti/(?P<context>\w[^/]*)/$',
            views.LTICourseSelector.as_view(), name='lti-course-select'),
    re_path(r'^_impersonate/', include('impersonate.urls')),
    re_path(r'^stats/$$', TemplateView.as_view(template_name='stats.html')),
    path('smoketest/', include('smoketest.urls')),
    # re_path(r'infranil/', include('infranil.urls')),
    re_path(r'^uploads/(?P<path>.*)$$',
            serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^sign_s3/$', views.SignS3View.as_view()),
    re_path(r'^dashboard/$', views.DashboardView.as_view(),
            name='course-list-view'),
    re_path(r'^dashboard/profile/$', views.UserProfileView.as_view(),
            name='profile-view'),
    re_path(r'^course/create/$', views.CourseCreateView.as_view(),
            name='course-create-view'),
    re_path(r'^course/(?P<pk>\d+)/$', views.CourseDetailView.as_view(),
            name='course-detail-view'),
    re_path(r'^course/(?P<pk>\d+)/edit/$', views.CourseEditView.as_view(),
            name='course-edit-view'),
    re_path(r'^course/(?P<pk>\d+)/delete/$', views.CourseDeleteView.as_view(),
            name='course-delete-view'),
    re_path(r'^course/(?P<pk>\d+)/roster/$', views.CourseRosterView.as_view(),
            name='course-roster-view'),
    re_path(r'^course/(?P<pk>\d+)/roster/promote/$',
            views.CourseRosterPromoteView.as_view(),
            name='course-roster-promote-view'),
    re_path(r'^course/(?P<pk>\d+)/roster/demote/$',
            views.CourseRosterDemoteView.as_view(),
            name='course-roster-demote-view'),
    re_path(r'^course/(?P<pk>\d+)/roster/remove/$',
            views.CourseRosterRemoveView.as_view(),
            name='course-roster-remove-view'),
    re_path(r'^course/(?P<pk>\d+)/roster/resend-invite/$',
            views.CourseRosterResendEmailInviteView.as_view(),
            name='course-roster-resend-invite-view'),
    re_path(r'^course/(?P<pk>\d+)/roster/uninvite/$',
            views.CourseRosterUninviteView.as_view(),
            name='course-roster-uninvite-view'),
    re_path(r'^course/(?P<pk>\d+)/roster/invite/$',
            views.CourseRosterInviteUser.as_view(),
            name='course-roster-invite-user'),
    re_path(r'^course/(?P<pk>\d+)/project/create/$',
            views.ProjectCreateView.as_view(),
            name='course-project-create'),
    re_path(r'^course/(?P<pk>\d+)/project/(?P<project_pk>\d+)/$',
            views.ProjectView.as_view(),
            name='course-project-detail'),
    re_path(r'^course/(?P<pk>\d+)/project/(?P<project_pk>\d+)/delete/$',
            views.ProjectDeleteView.as_view(),
            name='course-project-delete'),
]


# Design app
urlpatterns += [
    re_path(r'^design/$',
            design.views.Index.as_view(),
            name='design-index'),
    re_path(r'^design/identity/$',
            design.views.Identity.as_view(),
            name='design-identity'),
    re_path(r'^design/colors/$',
            design.views.Colors.as_view(),
            name='design-colors'),
    re_path(r'^design/typography/$',
            design.views.Typography.as_view(),
            name='design-typography'),
    re_path(r'^design/components/$',
            design.views.Components.as_view(),
            name='design-components'),
]


if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        re_path(r'^__debug__/', include(debug_toolbar.urls)),
    ]
