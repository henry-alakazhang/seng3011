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
def process(request):
    charsToProcess = list()
    for RIC in request.Data.RIC:
        for stockChar in request.Data.CharInfo.fileData[RIC]:
            if (request.matchesReq(stockChar)):
                charsToProcess.append(stockChar)
    upperWindow = int(request.upperWindow)
    lowerWindow = int(request.lowerWindow)
    data = request.Data
    result = list()
    for stockChar in charsToProcess:
        result.append((stockChar,calcCumRet(stockChar,upperWindow,lowerWindow,data)))
    return result

#Process each individual stock characteristic
def calcCumRet(stockChar,upperWindow,lowerWindow,data):
    cumRet = dict()
    for i in range(lowerWindow,upperWindow+1):
        date = datetime.datetime.strptime(stockChar['Event Date'],"%d-%b-%y") + datetime.timedelta(days=i)        
        cumRet[i] = data.getCumRet(stockChar,date.strftime("%d-%b-%y").lstrip('0'))
    return cumRet

def processData(priceFile,charFile,params):
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
    return process(request)
    
