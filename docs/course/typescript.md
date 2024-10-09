# Introduction à TypeScript

`TypeScript` est un langage de programmation qui s'appuie sur `JavaScript`, tout en ajoutant des fonctionnalités comme les **types statiques**, qui permet notamment à savoir à l'avance dans notre IDE si notre code est correct et s'éxecutera bien. C'est un langage qui rend `JavaScript` plus **robuste**, **lisible** et permet aux développeurs de coder avec plus de **sécurité** en évitant certaines erreurs courantes. Il est de plus en plus utilisé dans le développement d'applications web modernes pour sa capacité à améliorer la **qualité** et la **maintenabilité** du code.

## Qui a créé TypeScript ?

`TypeScript` a été créé par **Microsoft** en 2012, sous la direction de Anders Hejlsberg, un ingénieur en chef renommé qui est aussi le principal créateur du C# et d'autres encore. L'idée était **d'améliorer** les outils de développement pour les projets `JavaScript` à grande échelle.

## Pourquoi TypeScript a été créé ?

`TypeScript` a été conçu pour combler certaines lacunes de `JavaScript`, notamment le manque de **types statiques**. Dans des projets de grande envergure, l'absence de typage peut rendre la maintenance et la **gestion des erreurs** très difficiles. `TypeScript` permet aux développeurs d'ajouter des types à leur code `JavaScript`, ce qui améliore la **lisibilité**, la détection des erreurs et la collaboration au sein des équipes de développement. En d'autres termes, `TypeScript` est une évolution de `JavaScript` qui facilite la **gestion des projet**.

## Comment fonctionne TypeScript ?

`TypeScript` fonctionne en tant que sur-ensemble de `JavaScript`. Cela signifie que tout code `JavaScript` valide est également du code `TypeScript` valide. Cependant, `TypeScript` ajoute des fonctionnalités supplémentaires, comme le typage statique et les interfaces. Lorsque tu écris du code `TypeScript`, il est ensuite transpilé en `JavaScript` standard pour pouvoir être exécuté dans un navigateur ou un environnement comme Node.js. Cela permet d'avoir les avantages de `TypeScript` tout en restant compatible avec l'écosystème `JavaScript`.

## Qu'est-ce que le duck typing en TypeScript ?

Le **duck typing** est un concept issu du monde du **typage dynamique**. Il se résume à l'idée que "si quelque chose marche comme un canard et mange comme un canard, alors c'est probablement un canard". En `TypeScript`, cela signifie qu'un objet peut être utilisé dans un certain contexte si sa forme correspond à ce qui est attendu, indépendamment de son instance. Par exemple, si on a une fonction qui demande en paramètre un objet `Chien` ayant une fonction `manger()` et qu'on donne à cette fonction un objet `Chat` qui possède une fonction `manger()` également, alors `TypeScript` n'y verra aucun inconvéniant à accepter ce genre d'opération et le code s'éxecutera sans problème, le tout est d'avoir un **objet équivalent** qui possède les mêmes propriétés et fonction qui l'objet demandé.

```ts
class Chien {
    manger(): string {
        return "Je mange!";
    }
}

class Chat {
    manger(): string {
        return "Je mange!";
    }
}

class Hamster {
    boire(): string {
        return "Je bois!";
    }
}

const chien = new Chien();
const chat = new Chat();
const hamster = new Hamster();

function action(chien: Chien): string {
    return chien.manger();
}

console.log(action(chien)) // ✔
console.log(action(chat)) // ✔
console.log(action(hamster)) // ✖ Hamster n'a pas de fonction manger() alors `TypeScript` interdit l'opération
```

## La théorie des ensembles en TypeScript

La théorie des ensembles en `TypeScript` se reflète dans la manière dont les types sont traités. Les types en `TypeScript` peuvent être vus comme des ensembles de valeurs possibles. Par exemple, un type string est un ensemble qui contient toutes les valeurs literal. `TypeScript` permet d'effectuer des opérations sur ces ensembles via des unions `|` et des intersections `&`.

```ts

type A = "hello world";
type checkA = A extends string ? true : false // checkA = true
// "hello world" fait bien parti de l'ensemble string

type checkString = string extends A ? true : false // checkString = false
// string ne fait pas parti de "hello world" car c'est un type literal

```

## L'opérateur keyof

L'opérateur **keyof** en `TypeScript` te permet de récupérer les clés (ou propriétés) d'un objet sous forme de type. Imaginons qu'on a un objet `Chien` qui a les propriétés `nom` et `race`. On peut utiliser l'opérateur `keyof` afin de récupérer les propriétés de l'objet voulu, ici `Chien` par exemple.

```ts
class Chien {
    nom: string;
    race: string;
}

function afficherValeur(chien: Chien, clef: keyof Chien) {
    return chien[clef];
}

const chien = { nom: "Toto", race: "Bulldog" };

console.log(afficherValeur(chien, "nom")); // ✔
console.log(afficherValeur(chien, "titi")); // ✖ TypeScript va surligner en rouge "titi" car la classe Chien ne possède pas de propriété "titi"
```

## L'opérateur satisfies

L'opérateur **satisfies** est un concept qui permet de donner un contrat à `TypeScript` afin de vérifier que se contrat soit bien respecté, tout en laissant plus de **flexibilité**. C'est utile lorsque qu'on veut être sûr que notre variable correspond à un type spécifique sans restreindre l'utilisation de cette variable. Cela permet d'avoir des types **plus complexes** tout en gardant la liberté de définir des **valeurs précises**.

```ts
type HexaColor = `#${string}`

const colorInfered = "#00000" satisfies HexaColor; // type #00000
const colorContract: HexaColor = "#00000"; // type #${string}

type StatusLabel = Record<string, string>

const labelsInfered = {
    admin: "toto",
    modo: "toto",
    user: "toto",
} satisfies StatusLabel

type labelsInferedKeys = keyof typeof labelsInfered // type "admin" | "modo" | "user"

const labelsContract: StatusLabel = {
    admin: "toto",
    modo: "toto",
    user: "toto",
}

type labelsContractKeys = keyof typeof labelsContract // type string
```

[Retour au Sommaire](./SUMMARY.md)