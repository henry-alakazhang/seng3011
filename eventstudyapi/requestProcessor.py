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
from eventstudyapi.request import Request, Data

#Process request
def process(request,error):    
    charsToProcess = list()
    for RIC in request.Data.RIC:
        if RIC in request.Data.CharInfo.fileData:
            for stockChar in request.Data.CharInfo.fileData[RIC]:
                if (request.matchesReq(stockChar)):
                    charsToProcess.append(stockChar)
        else:
            error += ("No Data found for #RIC: {}\n".format(RIC))
    upperWindow = int(request.upperWindow)
    lowerWindow = int(request.lowerWindow)
    data = request.Data
    result = list()
    for stockChar in charsToProcess:
        cumRet = calcCumRet(stockChar,upperWindow,lowerWindow,data)
        if (cumRet != None):
            result.append((stockChar,cumRet))
        else:            
            error += ("Invalid Date Range for {}: {} with window {} to {}\n".format(stockChar["#RIC"], stockChar["Event Date"], lowerWindow, upperWindow))
    return (result, error)

#Process each individual stock characteristic
def calcCumRet(stockChar,upperWindow,lowerWindow,data):
    cumRet = dict()
    for i in range(lowerWindow,upperWindow+1):
        date = datetime.datetime.strptime(stockChar['Event Date'],"%d-%b-%y") + datetime.timedelta(days=i)
        indivRet = data.getCumRet(stockChar,date.strftime("%d-%b-%y").lstrip('0'))
        if (indivRet != None):       
            cumRet[i] = indivRet
        else:
            return None        
    return cumRet

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
    
