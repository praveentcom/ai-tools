import { AutoTokenizer, PreTrainedTokenizer } from "@huggingface/transformers";

class TokenizerError extends Error {
	private code: string;

	constructor(message: string, code: string) {
		super(message);
		this.name = 'TokenizerError';
		this.code = code;
	}
}

export interface AutoTokenizerConfig {
    MODEL_PATH: string;
    MAX_TOKENS: number;
}

/**
 * For models that require a specific tokenizer configuration,
 * add the configuration and model path here.
 *
 * QWEN_2_5_CODER_7B:
 * https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
 */
export const autoTokenizerConfig = {
	QWEN_2_5_CODER_7B: {
		MODEL_PATH: 'Qwen/Qwen2.5-Coder-7B-Instruct',
		MAX_TOKENS: 32768,
	} as AutoTokenizerConfig,
};

export class HFAutoTokenizer {
	private modelPath: string;
	private tokenizer: PreTrainedTokenizer | null;

	constructor(modelPath: string) {
		if (!modelPath) {
			throw new Error('Model path is required');
		}

		const acceptedModelPaths = Object.values(autoTokenizerConfig).map(
			(config) => config.MODEL_PATH
		);
		if (!acceptedModelPaths.includes(modelPath)) {
			throw new Error(`Model path ${modelPath} is not supported.`);
		}

		this.modelPath = modelPath;
		this.tokenizer = null;
	}

	async initializeTokenizer() {
		if (!this.tokenizer) {
			this.tokenizer = await AutoTokenizer.from_pretrained(
				this.modelPath
			);
		}
		return this.tokenizer;
	}

	async encode(text: string) {
		try {
			if (!text) return false;

			// Input validation
			if (typeof text !== 'string') {
				throw new TypeError('Input must be a string');
			}

			const tokenizer = await this.initializeTokenizer();
			const tokens = tokenizer.encode(text);

			// Check token limit
			const modelConfig = Object.values(autoTokenizerConfig).find(
				(config) => config.MODEL_PATH === this.modelPath
			);

            if (!modelConfig) {
                throw new Error('Model configuration not found');
            }

			if (tokens.length > modelConfig.MAX_TOKENS) {
				throw new TokenizerError(
					`Token count ${tokens.length} exceeds limit of ${modelConfig.MAX_TOKENS}`,
					'TOKEN_LIMIT_EXCEEDED'
				);
			}

			return tokens;
		} catch (error) {
			if (error instanceof TypeError || error instanceof TokenizerError) {
				throw error;
			}

			throw new Error("Failed to encode text");
		}
	}
}