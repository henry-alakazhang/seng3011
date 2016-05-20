'''
Created on 30 Mar 2016

@author: Damon
'''

'''
Created on 5 Apr 2016

@author: Damon
'''
import re, datetime
from eventstudyapi.parser import Parser
from eventstudyapi.request import Request, Data, DataCore

#Process request
def process(request,error):   
    charsToProcess = list()
    for RIC in request.Data.RIC:
        if RIC in request.Data.CharInfo.fileData:
            for stockChar in request.Data.CharInfo.fileData[RIC]:
                if (request.matchesReq(stockChar)):
                    charsToProcess.append(stockChar)
        else:
            error.append("No Data found for #RIC: {}\n".format(RIC))
    upperWindow = int(request.upperWindow)
    lowerWindow = int(request.lowerWindow)
    data = request.Data
    result = list()
    for stockChar in charsToProcess:
        cumRet, volume = calcCumRet(stockChar,upperWindow,lowerWindow,data)
        if (cumRet != None):
            result.append((stockChar,cumRet,volume))
        else:            
            error.append("Invalid Date Range for {}: {} with window {} to {}\n".format(stockChar["#RIC"], stockChar["Event Date"], lowerWindow, upperWindow))
    return (result, error)

#Process each individual stock characteristic
def calcCumRet(stockChar,upperWindow,lowerWindow,data):
    cumRet = dict()
    volume = dict()
    minDate = datetime.datetime.strptime(stockChar['Event Date'],"%d-%b-%y")
    for i in range(lowerWindow,upperWindow+1):
        date = (minDate + datetime.timedelta(days=i)).strftime("%d-%b-%y").lstrip('0')
        indivRet, vol = data.getCumRet(stockChar,date)
        if (indivRet != None):       
            cumRet[i] = indivRet
            volume[i] = vol
        else:
            return None, None    
    return cumRet, volume

def processData(priceFile,charFile,params,error):
    #parse Files
    priceData = Parser(priceFile)
    charData = Parser(charFile)
    stockData = Data(priceData,charData)
    
    upper = re.compile("^upper_")
    lower = re.compile("^lower_")
    optVar = dict()
    for param in params:
        param_name = re.sub(re.compile("^[a-z]*_(.*)$"), '\\1', param).replace('_',' ')
        if param_name == "window":
            if upper.match(param):
                upperWindow = params[param]
            elif lower.match(param):
                lowerWindow = params[param]
            else:
                raise Exception('Invalid Variable ' + param)            
        else:
            if param_name not in optVar:
                optVar[param_name] = dict()
            if upper.match(param):
                optVar[param_name]["max"] = params[param]
            elif lower.match(param):
                optVar[param_name]["min"] = params[param]
            else:        
                raise Exception('Invalid Variable ' + param)
    
    request = Request(upperWindow,lowerWindow,optVar,stockData)
    return process(request,error)
    
def processWithDate(priceFile,params,error):
    priceData = Parser(priceFile)
    stockData = DataCore(priceData)
    
    upper = re.compile("^upper_")
    lower = re.compile("^lower_")
    optVar = dict()
    for param in params:
        param_name = re.sub(re.compile("^[a-z]*_(.*)$"), '\\1', param).replace('_',' ')
        if param_name == "window":
            if upper.match(param):
                upperWindow = params[param]
            elif lower.match(param):
                lowerWindow = params[param]
            else:
                raise Exception('Invalid Variable ' + param)            
        elif param == "date":
            searchDate = params[param]
        else :
            raise Exception('Invalid Variable ' + param)
    
    result = list()
    for ric in stockData.RIC:
        cumRet = dict()
        # for compatibility and laziness
        stockChar = {"#RIC" : ric, "Event Date" : searchDate}
        for i in range(int(lowerWindow),int(upperWindow)+1):
            date = datetime.datetime.strptime(searchDate,"%d-%b-%y") + datetime.timedelta(days=i)
            indivRet = stockData.getCumRet(stockChar,date.strftime("%d-%b-%y").lstrip('0'))
            if (indivRet != None):       
                cumRet[i] = indivRet
        if (cumRet != None):
            result.append((stockChar,cumRet))
        else:
            print ("Invalid Date range")
    return (result, error)