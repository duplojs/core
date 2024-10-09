### Raison d'être
Comme beaucoup de librairies, `Duplo` est né d'une frustration. Aujourd'hui `JavaScript` est un écosystème complet qui vous permet aussi bien de faire du front-end web, mobile ou desktops que du back-end. Mais, forcé d'avouer que les librairies front-end sont bien plus élaborées et complètes surtout d'un point de vue de développeur `Typescript`. Cela est bien dommage, `Typescript` aujourd'hui augmente significativement la maintenabilité de vos projets. Les frameworks front-end ont une intégration très intéressante de `Typescript`. Ils mettent à disposition énormément de helpers[^1] fortement typés mais flexibles qui facilitent la vie des développeurs. Malheureusement côté back-end si je prends pour exemple `Express` (peut-être pas le meilleur mais sûrement le plus représentatif et le plus répandu) le typage a été fait à côté de la librairie. Ce qui donne une impression de bricolage lorsqu'on l'utilise avec `Typescript`. 

Cependant `Express` propose une liberté complète dans ses points d'entrée. Il vous livre à vous-même avec dans une main un objet représentant la Request et dans l'autre la Response. Certains trouveront ça fantastique, il y a tout à construire. Donc pour chacun de vos points d'entrée, il faudra implémenter votre système de validation de données, vos systèmes d'authentification et gérer également leurs erreurs. Les middlewares[^5] pourront sûrement vous aider, sauf si vous souhaitez passer des données à votre fonction principale tout en gardant un typage réel. Vos solutions pourraient fonctionner, il faudrait alors bien documenter votre travail pour qu'il puisse continuer à être maintenu. Mais ne serait-ce pas mieux d'avoir un outil qui vous propose de vous décharger de tout l'aspect technique des vérifications et qui vous donnerait l'occasion de ne réfléchir qu'au besoin métier ? C'est dans ce but que `Duplo` a été créé, en vous proposant une solution agnostique[^2], opiniâtre[^3] et 100% typesafe[^4].

### Philosophie du framework
`Duplo` met d’abord l’accent sur la lisibilité. Toutes les solutions que vous mettrez en place avec lui seront explicites et claires, dans le but de créer un code auto-documenté.

Ensuite, `Duplo` est très opiniâtre. Si vous l'adoptez complètement, vous n'aurez plus à vous soucier des aspects techniques liés aux vérifications dans vos routes (authentification, validation des données de la requête, vérification en base de données, etc.). Une seule solution simple et précise se présentera à vous dès que vous créerez une nouvelle route.

Toutes les ressources que vous créerez avec `Duplo` seront réutilisables. La construction de routes ressemblera à un assemblage de blocs de code, comme un grand jeu de briques pour enfants : `Duplo`.

`Duplo` est entièrement typesafe[^4]. Tout le code que vous imbriquerez ensemble sera automatiquement compatible. Si vous modifiez quelque chose, `TypeScript` vous indiquera immédiatement l'impact de cette modification sur l’ensemble de votre application. Et cela, avec très peu de code supplémentaire en `TypeScript`, ce qui ne vous demandera pas plus de travail.

Enfin, `Duplo` se veut agnostique[^2]. Son core ne dépend d’aucune plateforme `JavaScript` spécifique et n'utilise que des APIs natives du langage. Cela le rend utilisable aussi bien avec `Node.js`, `Deno`, `Bun` qu'en environnement navigateur.

### Le scope
`Duplo` est comparable a un `Express` ou un `Fastify`, il se branche directement au APIs natives des platforms. `Duplo` ne prend pas en charge la couche ORM[^6] et gestion des services. Cependant il met des solutions pour intégrer ce que vous souhaitez. Le rôle de `Duplo` est de vous inciter a faire le plus de vérification possible pour vous garantir la fiabilité des données.

[^1]: Helpers: Fonctions utilitaires et asistant au typage.
[^2]: Agnostique: Qui n'est pas lié à une technologie particulière.
[^3]: Opiniâtre: vision tranchée sur les solutions possibles.
[^4]: Typesafe: Qui garantit la sécurité des types.
[^5]: Middleware: Fonction intermédiaire qui peut être utilisée pour effectuer des tâches supplémentaires avant ou après le traitement de la requête.
[^6]: ORM: Object-Relational Mapping, permet de manipuler des données de la base de données en utilisant des objets.

[Retour au Sommaire](./SUMMARY.md)