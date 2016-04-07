from django.conf.urls import url

from . import views

urlpatterns = [
    # url(r'^$', views.index, name='index'),
    url(r'^$', views.event_study_api_view, name='Event Study API View'),
    url(r'^log$', views.log_view, name="Log File View")
]
