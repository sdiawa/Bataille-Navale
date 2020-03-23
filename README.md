
# Bataille-Navale
Ce repo comprend la partie front et back du projet

## Installation En local (Dev)
### Requirement
- node v > 10 (npm)
- mysql
- IDE Webstorm 

### Front (ReactJs)
* Installation des dépendances 
`npm install` dans le repertoire par défaut du projet
* Test sur un serveur de dev 
`npm start` dans le repertoire par défaut du projet<br />
[http://localhost:3000](http://localhost:3000) sur le navigateur.
Vous pouvez voir les changements de votre code en direct.<br />
Les erreurs sont afficher dans la console.
### Back (Node)
* Installation des dépendances du back <br>
`cd Api/` aller sur le repertoire Api<br>
`npm install` dans ce repertoire
* Créer une base de données `MySql` avec les crédentials suivantes:<br>
`user` = root `password`="" `database`= "db_bn"<br>
ses infos peuvent être modifier dans le fichier [Api/db/Config.js](Api/db/Config.js)
* Lancer le serveur Back avec 
`npm start` toujours dans Api <br/>
[http://localhost:8000/api](http://localhost:3000/api) sur le navigateur.<br />
Les erreurs sont afficher dans la console.
