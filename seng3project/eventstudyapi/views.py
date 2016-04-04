from django.http import HttpResponse
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from eventstudyapi.upload_handler import handle_uploaded_file


def index(request):
    return HttpResponse("Hello world, you are at the Event Study API index.")


@api_view(['POST'])
def event_study_api_view(request, **kwargs):

    # Debug output statements
    print(request.data)
    print(request.FILES['stock_characteristic_file'])
    print(request.FILES['stock_price_data_file'])

    handle_uploaded_file(request.FILES['stock_characteristic_file'])
    handle_uploaded_file(request.FILES['stock_price_data_file'])

    # TODO: Change to handle generic upper_... & lower... params
    if request.POST.get('upper_cash_rate'):
        print ('upper_cash_rate field is valid')
        upper_cash_rate = request.data['upper_cash_rate']

    else:
        print('ERROR upper_cash_rate field not found')
        # TODO: Code to return an error to the user here

    if request.POST.get('lower_cash_rate'):
        print ('lower_cash_rate field is valid')
        lower_cash_rate = request.data['lower_cash_rate']

    else:
        print('ERROR lower_cash_rate field not found')
        # TODO: Code to return an error to the user here

    # Obtain upper_window and lower_window parameters
    if request.POST.get('upper_window'):
        print ('upper_window field is valid')
        upper_window = request.data['upper_window']

    else:
        print('ERROR upper_window field not found')
        # TODO: Code to return an error to the user here

    if request.POST.get('lower_window'):
        print ('lower_window field is valid')
        lower_window = request.data['lower_window']

    else:
        print('ERROR lower_window field not found')
        # TODO: Code to return an error to the user here

    # serializers = ResultSerializer()
    return HttpResponse("Hello world, you are at the Event Study API index.")