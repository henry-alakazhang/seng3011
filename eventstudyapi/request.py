'''
Created on 30 Mar 2016

@author: Damon
'''

class Request:
    # Initialise object
    def __init__(self, upperWindow, lowerWindow, optVar, Data):
        self.upperWindow = upperWindow
        self.lowerWindow = lowerWindow
        self.Data = Data
        self.processVar(optVar)
        
    # Process all optional parameters    
    def processVar(self, optVar):
        self.optVarNames = list()
        self.optVar = dict()
        for params in map(str.lower, optVar):
            if (self.Data.isExistingVariable(params)):
                self.optVarNames.append(params)
                self.optVar[params] = OptVar(optVar[params]["min"], optVar[params]["max"])
            else:
                raise Exception('Invalid Variable ' + params)
    
    # Checks if a given stock characteristic fulfils the request
    def matchesReq(self, stockChar):
        for varData in stockChar:
            if varData.lower() in self.optVar:                
                if not self.optVar[varData.lower()].matches(stockChar[varData]):
                    return False
        return True
        
class OptVar:
    # Initialise object
    def __init__(self, varMin, varMax):
        self.varMin = varMin
        self.varMax = varMax        
    
    # Check if value fulfils object criteria
    def matches(self, value):
        if self.varMax is None:           
            return value >= self.varMin
        if self.varMin is None:
            return value <= self.varMax        
        return value >= self.varMin and value <= self.varMax
            

class Data:
    # Takes the output of the parsers and puts it all into one object
    def __init__(self, F1, F2):
        self.RIC = F1.getRICs()
        self.PriceInfo = F1
        self.Variables = F2.getVars()
        self.CharInfo = F2
        self.calcCumRet()

    # Calculate the cumulative return for all data
    def calcCumRet(self):
        self.CumRet = dict()
        self.Volume = dict()
        for RIC in self.RIC:
            self.CumRet[RIC] = dict()
            self.Volume[RIC] = dict()
            stockPriceInfo = self.PriceInfo.getInfo(RIC)
            prevCumRet = 0
            for priceData in stockPriceInfo:
                if priceData["Last"] != "":  
                    if 'prevPrice' not in locals():                    
                        prevPrice = float(priceData["Last"])                  
                    currCumRet = prevCumRet + (float(priceData["Last"]) - prevPrice) / prevPrice
#                     print (currCumRet, prevPrice, priceData["Last"], priceData["Date[L]"], priceData["#RIC"])
                    self.CumRet[RIC][priceData["Date[L]"]] = currCumRet
                    prevCumRet = currCumRet
                    prevPrice = float(priceData["Last"])
                else:
                    self.CumRet[RIC][priceData["Date[L]"]] = prevCumRet
                if (priceData["Volume"] != ""):
                    self.Volume[RIC][priceData["Date[L]"]] = priceData["Volume"]
            del prevPrice     

    # Check if a given variable was in File2
    def isExistingVariable(self, var):
        if var in map(str.lower, self.Variables):
            return True
        else:
            return False
        
    # Gets the cumulative return for a stock at a given date
    def getCumRet(self, stockChar, eventDate):
        if (eventDate in self.CumRet[stockChar["#RIC"]]):
            if (eventDate in self.Volume[stockChar["#RIC"]]):
                return self.CumRet[stockChar["#RIC"]][eventDate], int(self.Volume[stockChar["#RIC"]][eventDate])
            else:
                return self.CumRet[stockChar["#RIC"]][eventDate], 0                
        else:
            return None, 0
        
