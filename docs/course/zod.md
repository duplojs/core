
# Introduction à la librairie Zod

Zod est une librairie de schéma qui permet de valider des données en fonction de règles définies. 
Son concept central est de refléter les types TypeScript et de les appliquer aux données via des objets qui s'exécutent au runtime. 
En plus d'être un reflet du typage, Zod permet également de vérifier la conformité des données selon des règles spécifiques.

## Mise en contexte

```typescript
const userNameSchema = zod.string();

const userSchema = zod.object({
  name: userNameSchema,
  age: zod.number(),
});
```

Dans cet exmple, `userNameSchema` et `userSchema` son des schema zod, ils représente des types. D'un point de vu runtime, ce sont des object.

```typescript
const userName = userNameSchema.parse("William"); // ✔
userNameSchema.parse(23); // ✖

const user = userSchema.parse({ name: "William", age: 23 }); // ✔
userSchema.parse({ toto: "tata" }); // ✖
```

Lors du parsing, zod va cloner la valeur reçue en fonction du schema. En cas d'echec il emmetera une erreur.

## Schema courament utilisais


## Conclusion

Zod est une librairie de validation de données puissante et flexible qui s'intègre parfaitement avec TypeScript.
Elle permet de définir des schémas complexes et de valider des données en fonction de ces schémas, offrant ainsi une solution robuste pour la gestion des entré dans les applications TypeScript.