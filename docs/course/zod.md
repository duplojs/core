# Introduction à la librairie Zod

Zod est une librairie de validation de schémas pour TypeScript. 
Elle permet de valider des données en fonction de schémas définis. 
Elle est très utile pour valider des données provenant de formulaires, d'APIs, etc.

## Gestions des erreurs

Zod permet de gérer les erreurs de validation de manière simple et efficace. Elle fournit des messages d'erreurs clairs et précis qui permettent de comprendre rapidement ce qui ne va pas.

```typescript
const schema = zod.object({
  name: zod.string(),
  age: zod.number(),
});

const result = schema.safeParse({ name: "John", age: "30" });

if (!result.success) {
  console.error(result.error.errors);
  // Output: [ { message: 'Invalid number', path: [ 'age' ] } ]
}
```

Les messages d'erreurs etant un peut trop générique, il est possible de les personnaliser.

```typescript
const schema = zod.object({
  name: zod.string().min(3, { message: "Le nom doit contenir au moins 3 caractères" }),
  age: zod.number().min(18, { message: "L'age doit être supérieur à 18" }),
});

const result = schema.safeParse({ name: "Jo", age: 15 });

if (!result.success) {
  console.error(result.error.errors);
  // Output: [ { message: 'Le nom doit contenir au moins 3 caractères', path: [ 'name' ] }, { message: 'L'age doit être supérieur à 18', path: [ 'age' ] } ]
}
```

Avec cette gestion simplifiée des erreurs, ont peut entrevoir la facilité de debuggage des données mais aussi la facilité de compréhension des erreurs pour les utilisateurs finaux.

Pour vous montrer un exemple plus concret, voici un exemple de validation d'un formulaire d'inscription :

```typescript
const registrationSchema = zod.object({
  email: zod.string().email({ message: "L'email n'est pas valide" }),
  password: zod.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
  confirmPassword: zod.string().refine((data) => data === data.password, {
	message: "Les mots de passe ne correspondent pas",
  }),
});

async function submit(form: any) {
  const result = registrationSchema.safeParse(form);

  if (!result.success) {
		// Logique de gestion des erreurs (affichage, popup, etc.)
	return;
  }
	// Logique de soumission du formulaire au serveur
}
```

On peut aussi envisager de l'utiliser coté serveur pour valider les données reçues par une API:
> :warning: Pour cette exemple, nous allons utiliser express.js

```typescript
// Request POST /login
app.post("/login", (req, res) => {
  const loginSchema = zod.object({
	email: zod.string().email({ message: "L'email n'est pas valide" }),
	password: zod.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
  });

  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
	res.status(400).json({ errors: result.error.errors });
	return;
  }
  // Logique de connexion
});
```

## Typescript first

Zod est une librairie TypeScript first, c'est à dire qu'elle est conçue pour être utilisée avec TypeScript. Elle fournit des types précis et des fonctions de validation qui sont compatibles avec TypeScript.

Avec Zod, la création de schémas permet de définir facilement des contrats de types très complexes. 
Ces contrats, générés après le parsing des schémas, jouent un rôle essentiel dans la gestion des données. Une fois les données validées par ces contrats, chaque transformation ou opération s’appuiera sur des valeurs sûres et conformes. 
Cela garantit non seulement le bon fonctionnement du code, mais améliore également sa lisibilité et sa maintenabilité. En structurant les données de cette manière, on crée un environnement de développement plus robuste, où les erreurs sont minimisées et où les intentions du développeur sont claires.

### 1. Génération automatique des types TypeScript

Zod peut non seulement valider vos données, mais aussi générer des types TypeScript à partir de vos schémas, ce qui rend la validation des types à la fois statique (compilation) et dynamique (exécution).

```typescript
const userSchema = zod.object({
  name: zod.string(),
  age: zod.number(),
});

type User = zod.infer<typeof userSchema>; // equal { name: string, age: number }

const user: User = { name: "Jane", age: 30 };
```

### 2. Validation avancée

#### 2.1. Validation conditionnelle

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

#### 2.2. Schéma récursif
Zod permet également de valider des structures récursives comme des arbres ou des listes chaînées :

```typescript
const categorySchema = zod.object({
  name: zod.string(),
  subcategories: zod.array(zod.lazy(() => categorySchema)).optional(),
});
```

### 3. Combinaison de schémas
Zod permet la combinaison de schémas à l'aide de méthodes comme merge et union pour valider des structures complexes.

#### 3.1. Union (ou exclusif)

```typescript
const stringOrNumber = zod.union([zod.string(), zod.number()]);

const parsedValue = stringOrNumber.safeParse(42); // Acceptera un nombre ou une chaîne
```

#### 3.2. Merge (combiner des schémas)

```typescript
const baseUserSchema = zod.object({
  name: zod.string(),
});

const adminUserSchema = baseUserSchema.merge(zod.object({
  isAdmin: zod.boolean(),
}));

const parsedAdmin = adminUserSchema.parse({ name: "Alice", isAdmin: true });
```

### 4. Parsing vs Validation

Zod fait la distinction entre parsing et validation. Le parsing essaie de transformer les données brutes, tandis que la validation ne fait que vérifier sans transformer.

```typescript
const stringToNumber = zod.string().transform((val) => parseInt(val, 10));
// version simplifiée zod.coerce.number()

const parsed = stringToNumber.parse("123");
```
