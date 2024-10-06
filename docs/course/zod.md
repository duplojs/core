
# Introduction à la librairie Zod

Zod est une librairie de schéma qui permet de valider des données en fonction de règles définies. 
Son concept central est de refléter les types TypeScript et de les appliquer aux données via des objets qui s'exécutent au runtime. 
En plus d'être un reflet du typage, Zod permet également de vérifier la conformité des données selon des règles spécifiques.

## Mise en contexte

```typescript
const userSchema = zod.object({
  name: zod.string(),
  age: zod.number(),
});

const user = userSchema.parse({ name: "Jane", age: 30 });
```

Dans cet exmple, le schema `userSchema` est un objet qui définit les types des clés `name` et `age` de l'objet passé à la méthode `parse`.

Lors du parsing, zod va cloner le schema et contruire un nouvel objet avec les valeurs passées en paramètre. Si les valeurs ne correspondent pas aux types définis, une erreur sera levée.

Zod se distingue par son typage fort, offrant une validation des données tout en respectant les types définis dans TypeScript.
Il est aussi capable d'effectuer du checking de types.

## Schema complexe

À travers les schemas zod, il possible de definir des regles complexes.

#### Validation conditionnelle

Zod permet de définir des validations conditionnelles, comme dans cet exemple où la validation change selon la valeur d'une clé.

```typescript
const conditionalSchema = zod.object({
  role: zod.enum(["admin", "user"]),
  permissions: z.string().optional(),
}).refine(data => data.role === "admin" ? !!data.permissions : true, {
  message: "Les permissions sont requises pour les admins.",
  path: ["permissions"],
});
```

#### Schéma récursif

Zod permet également de valider des structures récursives comme des arbres ou des listes chaînées :

```typescript
const categorySchema = zod.object({
  name: zod.string(),
  subcategories: zod.array(zod.lazy(() => categorySchema)).optional(),
});
```

#### Combinaison de schémas

Zod permet la combinaison de schémas à l'aide de méthodes comme merge et union pour valider des structures complexes.

##### Union (ou exclusif)

```typescript
const stringOrNumber = zod.union([zod.string(), zod.number()]);

const parsedValue = stringOrNumber.parse(42); // Acceptera un nombre ou une chaîne
```

##### Merge (combiner des schémas)

```typescript
const baseUserSchema = zod.object({
  name: zod.string(),
});

const adminUserSchema = baseUserSchema.merge(zod.object({
  isAdmin: zod.boolean(),
}));

const parsedAdmin = adminUserSchema.parse({ name: "Alice", isAdmin: true });
```

## Parsing sécurisé

```typescript
const schema = zod.object({
  name: zod.string(),
  age: zod.number(),
});

const result = schema.safeParse({ name: "John", age: "30" });

console.log(result.success); // false
console.log(result.error.errors); // [ { message: 'Invalid number', path: [ 'age' ] } ]
```

Dans cet exemple, la validation échoue car la valeur de age est une chaîne de caractères alors qu'un nombre est attendu. La méthode safeParse retourne un objet contenant les détails de la validation, indiquant le succès ou l'échec de celle-ci ainsi que les erreurs éventuelles.

## Conclusion

Zod est une librairie de validation de données puissante et flexible qui s'intègre parfaitement avec TypeScript.
Elle permet de définir des schémas complexes et de valider des données en fonction de ces schémas, offrant ainsi une solution robuste pour la gestion des données dans les applications TypeScript.