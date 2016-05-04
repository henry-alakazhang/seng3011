import http.client, json, sys

def printHelp():
    print("usage: runtests.py ([-hupe] [args])*")
    print("\t -h or --help \t \t \t displays help")
    print("\t -u or --url [URL|local|heroku]  changes url")
    print("\t -f or --file KEY \t \t \t set file key")
    print("\t -k or --key KEYNAME \t \t \t set file key parameter name")

url = "127.0.0.1:8000"
endpoint = "/eventapi/"
keyname = "file_key"
filekey = "0"

i = 1
if (len(sys.argv) > i):
    while i < len(sys.argv):
        if sys.argv[i] in ['-h', '--help']:
            printHelp()
            sys.exit()
        if sys.argv[i] in ['-u', '--url']:
            if sys.argv[i+1] == "local":
                # backwards compatibility
                print("Using local deployment")
            elif sys.argv[i+1] == "heroku":
                url = "seng3011-eventstudy.herokuapp.com"
            else:
                parts = sys.argv[i+1].split('/')
                url = parts[0]
                endpoint = '/' + '/'.join(map(str,parts[1:]))
        if sys.argv[i] in ['-f', '--file']:
            filekey = sys.argv[i+1]
        i += 2
else:
    printHelp()
    sys.exit()

conn = http.client.HTTPConnection(url)
headers = {
    'cache-control': "no-cache",
}

#
# Test 1 - price window size
#

print("-----------------")
print("Testing size of price window:")
passed = True;
# test with small window
conn.request("GET", endpoint + "?" + keyname + "=" + filekey + "&upper_window=1&lower_window=-1", headers=headers)
res = conn.getresponse()
data = json.loads(res.read().decode("utf-8"))
for ric in data['events'][0]['returns']:
    if len(data['events'][0]['returns'][ric]) != 3:
        passed = False;
print(".")

if passed: 
    # test with larger window
    conn.request("GET", endpoint + "?" + keyname + "=" + filekey + "&upper_window=10&lower_window=-10", headers=headers)
    res = conn.getresponse()
    data = json.loads(res.read().decode("utf-8")) 
    for ric in data['events'][0]['returns']:
        if len(data['events'][0]['returns'][ric]) != 21:
            passed = False
            print ("1/2 ",end="")
            break

if passed:
    print ("2/2 OK!")
else:
    print ("FAIL!")

#
# Test 2 - out of order price windows return error instead of results
#

print("-----------------")
print("Testing out of order price window:")
passed = True;
conn.request("GET", "/eventapi/?file_key=0&upper_window=-1&lower_window=1", headers=headers)
res = conn.getresponse()
data = json.loads(res.read().decode("utf-8")) 
if len(data['events']) > 0:
    passed = False;
print(".")

if passed:
    print ("1/1 OK!")
else:
    print ("FAIL!")


#
# Test 3 - Missing parameters are treated as min/max values
#

print("-----------------")
print("Testing missing parameters still return results")
passed = True;

conn.request("GET", endpoint + "?" + keyname + "=" + filekey + "&upper_window=-1&lower_window=1", headers=headers)
res = conn.getresponse()
data = json.loads(res.read().decode("utf-8")) 
if len(data['events']) == 0:
    passed = False;
print(".")

if passed :
    passed = True;
    conn.request("GET", endpoint + "?" + keyname + "=" + filekey + "&upper_window=-1&lower_window=1", headers=headers)
    res = conn.getresponse()
    data = json.loads(res.read().decode("utf-8")) 
    if len(data['events']) == 0:
        passed = False;
        print ("1/2 ",end="")
    print(".")

if passed:
    print ("2/2 OK!")
else:
    print ("FAIL!")


#
# Test 4 - Two blank parameters should be treated like they don't exist
#

print("-----------------")
print("Testing multiple blank parameters")
passed = True
conn.request("GET", endpoint + "?" + keyname + "=" + filekey + "&upper_window=-1&lower_window=1&lower_macroevent=&upper_macroevent=", headers=headers)
res = conn.getresponse()
data = json.loads(res.read().decode("utf-8")) 

conn.request("GET", endpoint + "?" + keyname + "=" + filekey + "&upper_window=-1&lower_window=1", headers=headers)
res = conn.getresponse()
data2 = json.loads(res.read().decode("utf-8")) 

#TODO: check for some equality and all that
print(".")
print("Hey! Write this test!")


#
# Test 5 - missing window crash
#

print("-----------------")
print("Testing safe handling of missing windows")
passed = True;
conn.request("GET", endpoint + "?" + keyname + "=" + filekey + "&upper_window=&lower_window=", headers=headers)
res = conn.getresponse()
data = res.read().decode("utf-8")

# check for our ugly error message rather than django fail
if not data.startswith('FATAL'):
    passed = False;
print(".")

if passed:
    print ("1/1 OK!")
else:
    print ("FAIL!")