'''
Created on 5 Apr 2016

@author: Damon
'''
import csv
import datetime
import re
import sys
import cProfile

from eventstudyapi.request import Request, Data

from eventstudyapi.parser import Parser


#Process request
def process(request):
    charsToProcess = list()
    for RIC in request.Data.RIC:
        if RIC in request.Data.CharInfo.fileData:
            for stockChar in request.Data.CharInfo.fileData[RIC]:
                if (request.matchesReq(stockChar)):
                    charsToProcess.append(stockChar)
    upperWindow = int(request.upperWindow)
    lowerWindow = int(request.lowerWindow)
    data = request.Data
    result = list()
    for stockChar in charsToProcess:
        cumRet = calcCumRet(stockChar,upperWindow,lowerWindow,data)
        if (cumRet != None):
            result.append((stockChar,cumRet))
        else:
            print ("Invalid Date range")
    return result

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


priceFile = str(sys.argv[1])
charFile = str(sys.argv[2])
params = sys.argv[3:]

#parse Files
priceData = Parser(priceFile)
charData = Parser(charFile)
stockData = Data(priceData,charData)

upper = re.compile("^upper_")
lower = re.compile("^lower_")
value = re.compile("^.*=(.*)$")
optVar = dict()
for param in params:
    param_name = re.sub(re.compile("^[a-z]*_(.*)=.*$"), '\\1', param).replace('_',' ')
    if param_name == "window":
        if upper.match(param):
            upperWindow = value.search(param).group(1)
        elif lower.match(param):
            lowerWindow = value.search(param).group(1)
        else:
            raise Exception('Invalid Variable ' + param)            
    else:
        if param_name not in optVar:
            optVar[param_name] = dict()
        if upper.match(param):
            optVar[param_name]["max"] = value.search(param).group(1)
        elif lower.match(param):
            optVar[param_name]["min"] = value.search(param).group(1)    
        else:        
            raise Exception('Invalid Variable ' + param)

request = Request(upperWindow,lowerWindow,optVar,stockData)
cumRets = process(request)

if sys.version_info >= (3,0,0):
    f = open("output.csv", 'w', newline='')
else:
    f = open("output.csv", 'wb')
c = csv.writer(f)
heads = list()
heads.append("RelDate")
for chars in cumRets:
    heads.append(chars[0]['#RIC']+"_ Cum.R")
c.writerow(heads)
for i in range(int(lowerWindow),int(upperWindow)):
    row = list()
    row.append(str(i))
    for chars in cumRets:
        row.append(cumRets[cumRets.index(chars)][1][i])
    c.writerow(row)

pr.disable()
