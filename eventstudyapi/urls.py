from django.conf.urls import url

from . import views

urlpatterns = [
    # url(r'^$', views.index, name='index'),
    url(r'^$', views.event_study_api_view, name='Event Study API View'),
    url(r'^events$', views.events_view, name='return_events'),
]
