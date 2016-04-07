import datetime

from django.http import HttpResponse, JsonResponse
from eventstudyapi.upload_handler import handle_uploaded_file
from rest_framework.decorators import api_view
from . import requestProcessor
import timeit
import datetime

def index(request):
    return HttpResponse("Hello world, you are at the Event Study API index.")

@api_view(['POST'])
def event_study_api_view(request, **kwargs):

    processing_time_start = timeit.default_timer()
    start_date_time = datetime.datetime.now()

    # Debug output statements
    # print(request.data)
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
            
    # build log file            
    log = "Team Cool\n"
    log += "Event Study API v1.0\n"
    log += "Input files:\n"
    log += str(request.FILES.get('stock_characteristic_file')) + "and" + str(request.FILES.get('stock_price_data_file'))
    log += "\nParameters passed:\n"
    log += str(valid_params_dict)
    
    processing_time_end = timeit.default_timer()
    Elapsed_time = processing_time_end - processing_time_start
    log += 'Elapsed time:' + str(Elapsed_time) + 's\n'
 
    start_date_time = datetime.datetime.now()
    end_date_time = datetime.datetime.now()
    log += 'start_date_time: ' + str(start_date_time) + ' end_date_time: ' + str(end_date_time) + '\n'

    with open('media/log.txt', 'w') as file:
        file.write(log)

    # Process query
    total_cum_rets = requestProcessor.processData('media/' + str(request.FILES.get('stock_price_data_file')), 'media/' + str(request.FILES.get('stock_characteristic_file')), valid_params_dict)
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
            indivCumRets.append(chars[1][i])
        for event in JsonCumRets["events"]:
            date = reformat_date(chars[0]["Event Date"])
            if event["date"] == date:
                event["returns"][chars[0]["#RIC"]] = indivCumRets       
                dateFound = True      
                break
        if not dateFound:
            event = dict()
            event["date"] = reformat_date(chars[0]["Event Date"])
            event["returns"] = dict()
            event["returns"][chars[0]["#RIC"]] = indivCumRets   
            JsonCumRets["events"].append(event)                
    return JsonCumRets

def reformat_date(date_string):
    return datetime.datetime.strptime(date_string, '%d-%b-%y').strftime('%d/%m/%y')

def log_view(request):
    response = HttpResponse(open('media/log.txt'), content_type='application/txt')
    response['Content-Disposition'] = 'attachment; filename=log.txt'
    return response