from django.conf import settings
from django.conf.urls import include, url
from django.contrib import admin
from django.views.generic import TemplateView
from django.views.static import serve
from locustempus.main import views, viewsets
from rest_framework import routers


admin.autodiscover()


auth_urls = url(r'^accounts/', include('django.contrib.auth.urls'))
if hasattr(settings, 'CAS_BASE'):
    auth_urls = url(r'^accounts/', include('djangowind.urls'))

router = routers.DefaultRouter()
router.register(r'project', viewsets.ProjectApiView, basename='api-project')
router.register(r'layer', viewsets.LayerApiView, basename='api-layer')

urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^accounts/',
        include('django_registration.backends.activation.urls')),
    auth_urls,
    url(r'^$', views.IndexView.as_view(), name='course-list-view'),
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
    url(r'^course/(?P<pk>\d+)/project/(?P<project_pk>\d+)/edit/$',
        views.ProjectUpdateView.as_view(),
        name='course-project-edit'),
    url(r'^course/(?P<pk>\d+)/project/(?P<project_pk>\d+)/delete/$',
        views.ProjectDeleteView.as_view(),
        name='course-project-delete'),
    url(r'^course/(?P<pk>\d+)/project/(?P<project_pk>\d+)/assignment/create/$',
        views.AssignmentCreateView.as_view(),
        name='assignment-create'),
    url(r'^course/(?P<pk>\d+)/project/(?P<project_pk>\d+)/assignment/$',
        views.AssignmentDetailView.as_view(),
        name='assignment-detail'),
    url(r'^course/(?P<pk>\d+)/project/(?P<project_pk>\d+)/assignment/update/$',
        views.AssignmentUpdateView.as_view(),
        name='assignment-update'),
    url(r'^course/(?P<pk>\d+)/project/(?P<project_pk>\d+)/assignment/delete/$',
        views.AssignmentDeleteView.as_view(),
        name='assignment-delete'),
]


if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        url(r'^__debug__/', include(debug_toolbar.urls)),
    ]
