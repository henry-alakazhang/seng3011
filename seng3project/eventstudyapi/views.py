from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from eventstudyapi.upload_handler import handle_uploaded_file
from . import requestProcessor
from eventstudyapi.parser import Parser
from eventstudyapi.request import Request, Data


def index(request):
    return HttpResponse("Hello world, you are at the Event Study API index.")


@api_view(['POST'])
def event_study_api_view(request, **kwargs):

    # Debug output statements
    # print(request.data)
    print(request.FILES.get('stock_characteristic_file'))
    print(request.FILES.get('stock_price_data_file'))

    handle_uploaded_file(request.FILES['stock_characteristic_file'])
    handle_uploaded_file(request.FILES['stock_price_data_file'])

    # Standard dict methods do not work on the QueryDict, thus convert to a std dict
    request_dict = dict(request.data)
    valid_params_dict = dict()
    
    # Iterate over the request dict, looking for valid params or files
    for key, value in request_dict.items():
        if key.endswith('window'):
            if key.startswith('upper_'):
                upperWindow = value[0]
            elif key.startswith('lower_'):
                lowerWindow = value[0]
        if key.startswith('upper_') or key.startswith('lower_'):
            print(key, value)
            valid_params_dict[key] = value[0]
        elif not (key.startswith('stock_price_data_file') or key.startswith('stock_characteristic_file')):
            print('The following parameter is invalid: ' + str(key) + str(value))

    # Check the 2 necessary params were specified otherwise return an error
    required_params = ['upper_window', 'lower_window']
    for param in required_params:
        if param not in valid_params_dict:
            print('ERROR The following required parameter was not correctly provided:' + param)
            # TODO: Code to return an error to the user here
            
    # Process query
    total_cum_rets = requestProcessor.processData('seng3project/media/' + str(request.FILES.get('stock_price_data_file')),'seng3project/media/' + str(request.FILES.get('stock_characteristic_file')),valid_params_dict)
    requestResponse = convertToJson(total_cum_rets,valid_params_dict,lowerWindow,upperWindow)
    # serializers = ResultSerializer()
    #return HttpResponse("Hello world, you are at the Event Study API index.")
    return JsonResponse(requestResponse)

def convertToJson(cumRets,params,lowerWindow,upperWindow):
    JsonCumRets = dict()
    JsonCumRets["parameters"] = params
    JsonCumRets["events"] = list()
    cumRets = sorted(cumRets, key=lambda k: k[0]['Event Date'])   
    for chars in cumRets:
        dateFound = False
        indivCumRets = list()
        for i in range(int(lowerWindow),int(upperWindow)):
            print (i)
            indivCumRets.append(chars[1][i])
        for event in JsonCumRets["events"]:
            if event["date"] == chars[0]["Event Date"]:   
                event["returns"][chars[0]["#RIC"]] = indivCumRets       
                dateFound = True      
                break
        if not dateFound:
            event = dict()
            event["date"] = chars[0]["Event Date"]
            event["returns"] = dict()
            event["returns"][chars[0]["#RIC"]] = indivCumRets   
            JsonCumRets["events"].append(event)                
    return JsonCumRets