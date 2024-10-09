# Introduction à la librairie `Zod`

`Zod` est une librairie de schéma qui permet de valider des données en fonction de règles définies. 
Son concept central est de refléter les types `TypeScript` et de les appliquer aux données via des objets qui s'exécutent au runtime. 
En plus d'être un reflet du typage, `Zod` permet également de vérifier la conformité des données selon des règles spécifiques.

## Mise en contexte

```ts
const userNameSchema = zod.string();

const userSchema = zod.object({
  name: userNameSchema,
  age: zod.number(),
});
```

Dans cet exmple, `userNameSchema` et `userSchema` son des schémas `Zod`, ils représentent des types. D'un point de vu runtime, ce sont des objets.

```ts
const userName = userNameSchema.parse("William"); // ✔
userNameSchema.parse(23); // ✖

const user = userSchema.parse({ name: "William", age: 23 }); // ✔
userSchema.parse({ toto: "tata" }); // ✖
```

Lors du parsing, `Zod` va cloner la valeur reçue en fonction du schéma. En cas d'echec il emmetera une erreur.

## Schémas couramment utilisés

### 1. Types de base

`Zod` propose des schémas pour tous les types primitifs de JavaScript.

- Chaîne de caractères (`zod.string()`)

Le schéma de chaîne de caractères valide les valeurs de type `string`.

```ts
const nameSchema = zod.string();

nameSchema.parse("Alice"); // ✔
nameSchema.parse(123); // ✖
```

- Nombre (`z.number()`)

Utilisé pour valider des nombres, et peut être configuré pour vérifier les entiers, les bornes, etc.

```ts
const ageSchema = zod.number().min(18);

ageSchema.parse(25); // ✔
ageSchema.parse(16); // ✖ (doit être ≥ 18)
```

- Booléen (`zod.boolean()`)

Valide les valeurs booléennes (`true` ou `false`).

```ts
const isActiveSchema = zod.boolean();

isActiveSchema.parse(true); // ✔
isActiveSchema.parse("true"); // ✖
```

- Null et Undefined (`zod.null()`, `zod.undefined()`)

Pour valider les valeurs `null` ou `undefined`.

```ts
const nullSchema = zod.null();
const undefinedSchema = zod.undefined();

nullSchema.parse(null); // ✔
undefinedSchema.parse(undefined); // ✔
```

- Literal (`zod.literal()`)

Pour valider une valeur spécifique.

```ts
const statusSchema = zod.literal("active");

statusSchema.parse("active"); // ✔
statusSchema.parse("inactive"); // ✖
```

### 2. Schémas combinés

`Zod` permet de composer plusieurs schémas pour créer des validations complexes.

- Objet (`zod.object()`)

Les schémas d'objet permettent de définir la structure et les types attendus pour les propriétés.

```ts
const userSchema = zod.object({
  name: zod.string(),
  age: zod.number().min(18),
  email: zod.string().email(),
});

userSchema.parse({
  name: "Alice",
  age: 25,
  email: "alice@example.com",
}); // ✔
```

- Tableau (`zod.array()`)

Valide les tableaux de valeurs d'un certain type.

```ts
const tagsSchema = zod.array(zod.string());  // OU zod.string().array()

tagsSchema.parse(["Zod", "Validation", "Types"]); // ✔
tagsSchema.parse(["Zod", 123]); // ✖ (éléments doivent être des chaînes)
```

- Enumération (`zod.enum()`)

Pour restreindre une valeur à un ensemble spécifique de choix.

```ts
const roleSchema = zod.enum(["admin", "user", "guest"]);

roleSchema.parse("admin"); // ✔
roleSchema.parse("superuser"); // ✖ (non inclus dans l'énumération)
```

- Union (`zod.union()`)

Permet de valider une valeur contre plusieurs schémas possibles.

```ts
const responseSchema = zod.union([zod.string(), zod.number()]);

responseSchema.parse("OK"); // ✔
responseSchema.parse(200); // ✔
responseSchema.parse(true); // ✖
```

### 3. Schémas optionnels et par défaut

`Zod` permet de rendre des champs optionnels ou de définir des valeurs par défaut.

- Optionnel (`zod.optional()`)

Rendre une propriété facultative dans un schéma.

```ts
const optionalAgeSchema = zod.object({
  name: zod.string(),
  age: zod.optional(zod.number()), // zod.number().optional()
});

optionalAgeSchema.parse({ name: "Alice" }); // ✔
optionalAgeSchema.parse({ name: "Alice", age: 25 }); // ✔
```

- Valeur par défaut (`zod.default()`)

Permet de définir une valeur par défaut si une donnée est absente.

```ts
const defaultSchema = zod.object({
  name: zod.string(),
  age: zod.number().default(30),
});

defaultSchema.parse({ name: "Alice" }); // { name: "Alice", age: 30 }
```

### 4. Validation personnalisée

`Zod` vous permet de définir des validations personnalisées avec la méthode `.refine()`.

```ts
const passwordSchema = zod.string().refine((pwd) => pwd.length >= 8, {
  message: "Le mot de passe doit contenir au moins 8 caractères.",
});

passwordSchema.parse("12345678"); // ✔
passwordSchema.parse("12345"); // ✖
```

On peut aussi customiser le message d'erreur directement dans la méthode de validation.

```ts
const userSchema = zod.object({
  name: zod.string({ message: "je veux ton nom !" }),
  age: zod.number({ message: "je veux ton âge !" }).min(18, "Tu es trop jeune").max(99, "tu es trop vieux"),
});
```

### 5. Transformer des données

`Zod` permet également de transformer des données lors de la validation avec .transform().

```ts
const stringToNumberSchema = zod.string().transform((val) => parseInt(val, 10));

stringToNumberSchema.parse("42"); // 42 (nombre)
```

On peut aussi éffectuer des transformations plus basic avec `.coerce.typeAttendu()` (`date()`, `number()`, etc).

```ts
const dateSchema = zod.coerce.date(); // equivalent à new Date("2022-01-01")
const numberSchema = zod.coerce.number(); // equivalent à parseInt("42", 10)

const date = dateSchema.parse("2022-01-01"); // (date)
const number = numberSchema.parse("42"); // (number)
```

## Conclusion

`Zod` est une librairie de validation de données puissante et flexible qui s'intègre parfaitement avec `TypeScript`.
Elle permet de définir des schémas complexes et de valider des données en fonction de ces schémas, offrant ainsi une solution robuste pour la gestion des entrées dans les applications `TypeScript`.

[Retour au Sommaire](./SUMMARY.md)