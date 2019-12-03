from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from django.views.generic import TemplateView
from django.views.static import serve
from locustempus.main import views

admin.autodiscover()


auth_urls = url(r'^accounts/', include('django.contrib.auth.urls'))
if hasattr(settings, 'CAS_BASE'):
    auth_urls = url(r'^accounts/', include('djangowind.urls'))

urlpatterns = [
    auth_urls,
    url(r'^$', views.IndexView.as_view(), name='course-list-view'),
    url(r'^admin/', admin.site.urls),
    url(r'^lti/', include('lti_provider.urls')),
    url(r'^_impersonate/', include('impersonate.urls')),
    url(r'^stats/$$', TemplateView.as_view(template_name='stats.html')),
    url(r'smoketest/', include('smoketest.urls')),
    url(r'infranil/', include('infranil.urls')),
    url(r'^uploads/(?P<path>.*)$$',
        serve, {'document_root': settings.MEDIA_ROOT}),
    url(r'^course/create/$', views.CourseCreateView.as_view(),
        name='course-create-view'),
    url(r'^course/list/$', views.CourseListView.as_view(),
        name='course-list-view'),
    url(r'^course/(?P<pk>\d+)/$', views.CourseDetailView.as_view(),
        name='course-detail-view'),
    url(r'^course/(?P<pk>\d+)/edit/$', views.CourseEditView.as_view(),
        name='course-edit-view')

]


if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        url(r'^__debug__/', include(debug_toolbar.urls)),
    ]
