from django.http import HttpResponse
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from eventstudyapi.upload_handler import handle_uploaded_file


def index(request):
    return HttpResponse("Hello world, you are at the Event Study API index.")


@api_view(['POST'])
def event_study_api_view(request, **kwargs):

    # Debug output statements
    # print(request.data)
    # print(request.FILES['stock_characteristic_file'])
    # print(request.FILES['stock_price_data_file'])

    handle_uploaded_file(request.FILES['stock_characteristic_file'])
    handle_uploaded_file(request.FILES['stock_price_data_file'])

    # Standard dict methods do not work on the QueryDict, thus convert to a std dict
    request_dict = dict(request.data)
    valid_params_dict = dict()

    # Iterate over the request dict, looking for valid params or files
    for key, value in request_dict.items():
        if key.startswith('upper_') or key.startswith('lower_'):
            print(key, value)
            valid_params_dict[key] = value
        elif not (key.startswith('stock_price_data_file') or key.startswith('stock_characteristic_file')):
            print('The following parameter is invalid: ' + str(key) + str(value))

    # Check the 2 necessary params were specified otherwise return an error
    required_params = ['upper_window', 'lower_window']
    for param in required_params:
        if param not in valid_params_dict:
            print('ERROR The following required parameter was not correctly provided:' + param)
            # TODO: Code to return an error to the user here

    # serializers = ResultSerializer()
    return HttpResponse("Hello world, you are at the Event Study API index.")