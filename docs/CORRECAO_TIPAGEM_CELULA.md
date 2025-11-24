# Correção de Erro de Tipagem - Rotas e Controller de Célula

**Data:** 24 de novembro de 2025  
**Arquivos Modificados:**

- `src/routes/celula.routes.ts`
- `src/controller/celulaController.ts`

## Problema Identificado

O TypeScript estava retornando o seguinte erro ao tentar compilar o projeto:

```
No overload matches this call.
The last overload gave the following error.
  Argument of type '(req: Request<CelulaParams>, res: Response, next: NextFunction) => Promise<void>'
  is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.

  Type 'ParamsDictionary' is missing the following properties from type 'CelulaParams':
  idCurso, semestreLetivo, anoLetivo
```

### Causas Principais

1. **Incompatibilidade de Tipos**: A interface `CelulaParams` não era compatível com `ParamsDictionary` do Express
2. **Falta de Index Signature**: O Express espera que interfaces de parâmetros tenham uma assinatura de índice (`Record<string, string>`)
3. **Tipagem Incorreta**: Parâmetros estavam sendo tipados como `number` quando o Express sempre recebe parâmetros como `string`

## Soluções Implementadas

### 1. Adição de Index Signature na Interface

**Antes:**

```typescript
interface CelulaParams {
	idCurso: string;
	semestreLetivo: string;
	anoLetivo: string;
}
```

**Depois:**

```typescript
interface CelulaParams extends Record<string, string> {
	idCurso: string;
	semestreLetivo: string;
	anoLetivo: string;
}
```

**Motivo:** O Express define `ParamsDictionary` como `Record<string, string>`, permitindo acesso dinâmico aos parâmetros. Ao estender `Record<string, string>`, a interface se torna compatível com o tipo esperado.

### 2. Correção da Tipagem dos Parâmetros

Os parâmetros de rota no Express **sempre** chegam como strings, não como números. Mesmo que a URL contenha `/celula/123`, o valor `123` é recebido como a string `"123"`.

**No Controller (`celulaController.ts`):**

```typescript
export const getCelulaCurso = async (
	req: Request<CelulaParams>,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		// Converter parâmetros string para number
		const idCurso = parseInt(req.params.idCurso);
		const semestreLetivo = parseInt(req.params.semestreLetivo);
		const anoLetivo = parseInt(req.params.anoLetivo);

		// Validar conversão
		if (isNaN(idCurso) || isNaN(semestreLetivo) || isNaN(anoLetivo)) {
			res.status(400).json({
				message:
					"Parâmetros inválidos. idCurso, semestreLetivo e anoLetivo devem ser números.",
			});
			return;
		}

		// ...resto do código
	} catch (error) {
		next(error);
	}
};
```

### 3. Tipagem Genérica no Router

**No arquivo de rotas (`celula.routes.ts`):**

```typescript
router.get<CelulaParams>(
	"/:idCurso/semestre/:semestreLetivo/ano/:anoLetivo",
	authMiddleware,
	getCelulaCurso,
);
```

Isso informa ao Express Router que esta rota específica usa a interface `CelulaParams` para seus parâmetros.

## Benefícios das Correções

1. **Type Safety**: O TypeScript agora valida corretamente os tipos em tempo de compilação
2. **Autocomplete**: IDEs oferecem sugestões automáticas para `req.params.idCurso`, etc.
3. **Validação em Runtime**: Adição de verificação `isNaN()` para prevenir erros quando valores inválidos são passados
4. **Compatibilidade com Express**: A interface agora segue o padrão esperado pelo framework
5. **Código Mais Robusto**: Tratamento explícito de conversão de tipos e validação de entrada

## Conceitos Importantes

### Por que `Record<string, string>`?

```typescript
interface Record<K extends string | number | symbol, T> {
	[P in K]: T;
}
```

- `Record<string, string>` cria um tipo que permite qualquer propriedade do tipo `string` com valores `string`
- Isso é equivalente a: `{ [key: string]: string }`
- Permite acesso dinâmico: `req.params['qualquerCoisa']`

### Conversão de Tipos em Express

```typescript
// URL: /celula/123/semestre/1/ano/2024

// ❌ ERRADO - req.params são strings, não numbers
const idCurso: number = req.params.idCurso;

// ✅ CORRETO - conversão explícita
const idCurso: number = parseInt(req.params.idCurso);
```

### Validação de Conversão

```typescript
// Sempre valide após conversão
if (isNaN(idCurso)) {
	res.status(400).json({ message: "idCurso inválido" });
	return;
}
```

## Arquivos Relacionados

- `src/routes/celula.routes.ts` - Definição de rotas e interface `CelulaParams`
- `src/controller/celulaController.ts` - Handlers com validação e conversão de tipos
- `src/middleware/authMiddleware.ts` - Middleware de autenticação
- `src/middleware/roleMiddleware.ts` - Middleware de controle de papéis

## Referências

- [Express TypeScript Docs](https://expressjs.com/en/guide/routing.html)
- [TypeScript Utility Types - Record](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)
- [DefinitelyTyped - Express](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/express)
