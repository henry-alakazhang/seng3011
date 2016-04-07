import datetime
from random import choice
from string import ascii_uppercase

from django.http import HttpResponse, JsonResponse
from eventstudyapi.upload_handler import handle_uploaded_file
from rest_framework.decorators import api_view
from . import requestProcessor
import timeit
import datetime
import os


def index(request):
    return HttpResponse("Hello world, you are at the Event Study API index.")

@api_view(['POST'])
def event_study_api_view(request, **kwargs):
    error = ""
    fatal = False

    request_POST_dict = dict(request.POST)

    processing_time_start = timeit.default_timer()
    start_date_time = datetime.datetime.now()

    # Debug output statements
    # print(request.data)
    file_key = ''.join(choice(ascii_uppercase) for i in range(12))
    print (file_key)

    fileFoundKey = ""
    fileFound = False
    if 'file_key' not in request_POST_dict:
        error += 'ERROR There was no file_key supplied \n'
        fatal = False
    elif request.POST['file_key'] is '':
        error += 'ERROR File key was none \n'
        fatal = True
    else:
        # Check against existing files in media folder
        print('In Else')
        files_dict = list()
        for fn in os.listdir('media/'):
            print (str(fn))
            files_dict.append(str(fn))
            if fn .startswith(str(request.POST['file_key'])):
                fileFound = True
                fileFoundKey = str(request.POST['file_key'])
            else:
                print('No file match')

        if fileFound is True:
            print('Found ' + fileFoundKey)
        else:
            error += 'No file found with key: ' + request_POST_dict['file_key'][0] + '\n'
            fatal = True

        # file_key = request.GET['file_key']

    if not fileFound:
        files_required = ['stock_characteristic_file', 'stock_price_data_file']
        for reqfile in files_required:
            if reqfile not in request.FILES:
                error += 'ERROR: File ' + reqfile + ' not proided\n'
                fatal = True
            else:
                handle_uploaded_file(request.FILES[reqfile], file_key)
    
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
            if not fileFound:
                error += 'Warning: The following parameter is invalid: ' + str(key) + str(value) + '\n'

    # Check the 2 necessary params were specified otherwise return an error
    required_params = ['upper_window', 'lower_window']
    for param in required_params:
        if param not in valid_params_dict:
            error += 'ERROR: The following required parameter was not correctly provided:' + param + '\n'
            fatal = True
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
    log += '\nElapsed time:' + str(Elapsed_time) + 's\n'
 
    start_date_time = datetime.datetime.now()
    end_date_time = datetime.datetime.now()
    log += 'Start time: ' + str(start_date_time) + '\nEnd time: ' + str(end_date_time) + '\n'

    log += 'Errors/warnings generated:\n'
    log += error

    if fatal:
        return(HttpResponse("FATAL ERROR\n" + log))

    if not fileFound:
        with open('media/' + str(file_key) + '_' + 'log.txt', 'w') as file:
            file.write(log)
    else:
        with open('media/' + str(fileFoundKey) + '_' + 'log.txt', 'w') as file:
            file.write(log)

    # Process query
    if fileFound:
        total_cum_rets = requestProcessor.processData('media/' + str(fileFoundKey) + '_' + str('stock_price_data_file.csv'), 'media/' + str(fileFoundKey) + '_' + str('stock_characteristic_file.csv'), valid_params_dict)
    else:
        total_cum_rets = requestProcessor.processData('media/' + str(file_key) + '_' + str(request.FILES.get('stock_price_data_file')), 'media/' + str(file_key) + '_' + str(request.FILES.get('stock_characteristic_file')), valid_params_dict)

    requestResponse = convertToJson(total_cum_rets,valid_params_dict,lowerWindow,upperWindow)

    if not fileFound:
        requestResponse['file_key'] = file_key
    else:
        requestResponse['file_key'] = fileFoundKey

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

@api_view (['GET'])
def log_view(request):
    request_GET_dict = dict(request.GET)

    error = ""
    if 'file_key' not in request_GET_dict:
        error = "ERROR There was no file_key supplied"
    elif request.GET['file_key'] is '':
        error = 'ERROR File key was none'
    else:
        file_key = request.GET['file_key']              

    # for myFile in 'media/':
    #     if myFile.startswith('file_key')

    if (error == ""):
        response = HttpResponse(open('media/' + file_key + '_' + 'log.txt'), content_type='application/txt')
    else:
        response = HttpResponse(error)
    return response