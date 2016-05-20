from random import choice
from string import ascii_uppercase

from django.http import HttpResponse, JsonResponse
from eventstudyapi.upload_handler import handle_uploaded_file
from eventstudyapi.parser import EventsParser
from eventstudyapi.models import UserProfileExtras
from rest_framework.decorators import api_view
from . import requestProcessor
import timeit
import datetime
import os
import cProfile, pstats, io
import requests

def index(request):
    return HttpResponse("Hello world, you are at the Event Study API index.")

@api_view(['POST', 'GET'])
def event_study_api_view(request, **kwargs):
    #pr = cProfile.Profile()
    #pr.enable()
    processing_time_start = timeit.default_timer()
    start_date_time = datetime.datetime.now()

    if request.POST:
        (response, error, fatal) = upload_files(request)
    else:
        (response, error, fatal) = process_files(request)

#    response['logfile'] = log;
    if (fatal):
        return HttpResponse("FATAL " + '\n'.join(map(str,error)))
    
    # build log into json response
    log = dict();
    log['Team'] = "Team Cool"
    log['API ver.'] = "Event Study API v1.0"
    if request.POST:
        log['Input Files'] = str(request.FILES.get('stock_characteristic_file')) + " and " + str(request.FILES.get('stock_price_data_file'))
    else:
       log['Input Files'] = request.GET['file_key'] + "stock_characteristic_file.csv and " + request.GET['file_key'] + "stock_price_data_file.csv"

    processing_time_end = timeit.default_timer()
    Elapsed_time = processing_time_end - processing_time_start
    end_date_time = datetime.datetime.now()
    log['Elapsed Time'] = Elapsed_time
    log['Start time'] = start_date_time
    log['End time'] = end_date_time
    log['Errors/Warnings'] = error
    
    response['log'] = log
    #pr.disable()    
    #s = io.StringIO()
    #sortby = 'cumulative'
    #ps = pstats.Stats(pr, stream=s).sort_stats(sortby)
    #ps.print_stats()
    #print (s.getvalue())
    return JsonResponse(response)


def upload_files(request):
    request_POST_dict = dict(request.POST)
    error = list()
    fatal = False

    if 'file_key' in request_POST_dict:
        file_key = request.POST['file_key']
    else:
        file_key = ''.join(choice(ascii_uppercase) for i in range(12))

    files_required = ['stock_characteristic_file', 'stock_price_data_file']
    for reqfile in files_required:
        if reqfile not in request.FILES:
            error.append('ERROR: File ' + reqfile + ' not provided')
            fatal = True
        else:
            handle_uploaded_file(request.FILES[reqfile], file_key, reqfile)

    if fatal:
        return(0, error, True)

    if request.user:
        try:
            user = UserProfileExtras.objects.get(user=request.user)
        except:
            user = UserProfileExtras.objects.create(user=request.user)
        user.file_key = file_key
        user.save()
    
    requestResponse = dict()
    requestResponse['file_key'] = file_key
    return (requestResponse, error, False)

def process_files(request):
    request_GET_dict = dict(request.GET)
    error = list()
    fatal = False

    # find the file supplied
    fileFoundKey = ""
    fileFound = False
    if 'file_key' not in request_GET_dict:
        error += 'ERROR There was no file_key supplied \n'
        fatal = True
    elif request.GET['file_key'] is '':
        error.append('ERROR File key was none')
        fatal = True
    else:
        # Check against existing files in media folder
        if (request.GET['file_key'] == '0'):
            fileLoc = 'static/' 
        else:           
            files_dict = list()
            for fn in os.listdir('media/'):
                files_dict.append(str(fn))
                if fn .startswith(str(request.GET['file_key'])):
                    fileFound = True
                    fileFoundKey = str(request.GET['file_key'])
    
            if fileFound is False:
                error += 'No file found with key: ' + request_GET_dict['file_key'][0] + '\n'
                fatal = True
                        
            fileLoc = 'media/' + request.GET['file_key'] +'_'
    
    # Standard dict methods do not work on the QueryDict, thus convert to a std dict
    request_dict = dict(request.GET)
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
        elif (key == 'date'):
            valid_params_dict[key] = value[0]
        elif not (key.startswith('stock_price_data_file') or key.startswith('stock_characteristic_file')):
            if not fileFound:
                error.append('Warning: The following parameter is invalid: ' + str(key) + str(value))

    # Check the 2 necessary params were specified otherwise return an error
    required_params = ['upper_window', 'lower_window']
    for param in required_params:
        if param not in valid_params_dict:
            error.append('ERROR: The following required parameter was not correctly provided: ' + param)
            fatal = True
            # TODO: Code to return an error to the user here

    if fatal:
        return(0, error, fatal)

    # process query
    if 'date' in valid_params_dict:
        (total_cum_rets, error) = requestProcessor.processWithDate(fileLoc + str('stock_price_data_file.csv'), valid_params_dict, error)
    else:
        (total_cum_rets, error) = requestProcessor.processData(fileLoc + str('stock_price_data_file.csv'), 
                                        fileLoc + str('stock_characteristic_file.csv'), valid_params_dict, error)

    requestResponse = convertToJson(total_cum_rets,valid_params_dict,lowerWindow,upperWindow)
    return (requestResponse, error, False)

def convertToJson(cumRets,params,lowerWindow,upperWindow):
    JsonCumRets = dict()
    JsonCumRets["parameters"] = params
    JsonCumRets["events"] = list()
    cumRets = sorted(cumRets, key=lambda k: k[0]['Event Date'])   
    for chars in cumRets:
        dateFound = False
        indivCumRets = list()
        for i in range(int(lowerWindow),int(upperWindow)+1):            
            indivCumRets.append(float(chars[1][i]))
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
    for event in JsonCumRets["events"]:
        average_cum_ret = list()
        for i in range(int(lowerWindow),int(upperWindow)+1):
            sum_cum_ret = 0             
            for indiv_cum_ret in event["returns"]:
                sum_cum_ret = sum_cum_ret + event["returns"][indiv_cum_ret][i-int(lowerWindow)]
            average_cum_ret.append(sum_cum_ret/len(event["returns"]))
        event["average"] = average_cum_ret                
    return JsonCumRets

def reformat_date(date_string):
    return datetime.datetime.strptime(date_string, '%d-%b-%y').strftime('%d/%m/%y')

# atm this is just a private API call that we do for ease of processing in our analytics platform
@api_view (['GET'])
def events_view(request):
    request_GET_dict = dict(request.GET)

    error = ""
    if 'file_key' not in request_GET_dict:
        error = "ERROR There was no file_key supplied"
    elif request.GET['file_key'] is '':
        error = 'ERROR File key was none'
    else:
        if (request.GET['file_key'] != '0'):
            fileLoc = 'media/' + request.GET['file_key'] +'_'
        else:           
            fileLoc = 'static/'
    if (error):
        return HttpResponse(error);

    fileParsed = EventsParser(fileLoc + 'stock_characteristic_file.csv')

    return JsonResponse(fileParsed.getEvents())

@api_view(['GET'])
def get_news(request):
    request_GET_dict = dict(request.GET)
    url = 'http://bhsl.blue/news_request/'
    earliest_date = datetime.datetime.strptime(request.GET['earliest'], "%d-%b-%y")
    latest_date = datetime.datetime.strptime(request.GET['latest'], "%d-%b-%y")
    start = earliest_date.strftime("%Y-%m-%dT%H:%I:%S.%f")[:-3]+"Z"
    end = latest_date.strftime("%Y-%m-%dT%H:%I:%S.%f")[:-3]+"Z"
    url += 'start_date='+start+'/end_date='+end
    if ('RICs' in request_GET_dict):
        num_ric = int(request.GET['RICs'])
        url += '/instr_list='
        for i in range(0,num_ric):        
            url += request.GET["ric"+str(i)]+","
        url = url[:-1]
    url += '/'    
    print (url)
    r = requests.get(url,auth=('cool','seng3011'))
    return JsonResponse(r.json())
