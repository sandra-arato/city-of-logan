# city-of-logan
A data project for understanding community trends in Logan

## context
Logan City is a local government area situated within the south of the Brisbane metropolitan area in South East Queensland, Australia and it is home to more than 319,000 people from more than 217 different cultures. With such a scale, it can be challenging to get the pulse of the 69 suburbs and the residents living in it. So this project is an attempt to get a live feedback of the city via aggregating different data sources to a dashboard.

## solution
The back end service is running on node.js / express / socket.io, and manages requests and data parsing, then communicates results to the front end. There are 3 types of data coming in:
* Google Alerts - fetches news related to a specific suburb
* Google Trends - fetches search results related to a specific suburb
* Queensland TMR live traffic data - fetches traffic information

Once the news are fetched through Google Alerts, the title and first sentence of each article is analysed via sentiment analysis, and put into one of 3 buckets: positive, neutral or negative. The tone of the articles will affect the dashboard, and each suburb develops a profile based on the events happening at that given timeframe.

## insights
Search trends highlight that in most suburbs residents look for medical practices and research schools (primary and secondary). Another common pattern was that they often search for specific large merchants, such as 'Bunnings', 'Kmart',' or entertainment / leisure related topics, eg. 'movie', 'rsl', 'pizza'.

Traffic information revealed how large projects impact the everyday life of commuters, such as the Logan Enhancement Project, road restorations after Cyclone Debbie or the Logan Motorway upgrades.
