import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchWrapperService {
    private readonly client: Client;
    private readonly logger = new Logger(ElasticsearchWrapperService.name);
    private isAvailable = false;

    constructor() {
        const node = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
        this.client = new Client({ node });

        this.checkConnection();
    }

    private async checkConnection() {
        try {
            await this.client.ping({}, { requestTimeout: 1000 });
            this.isAvailable = true;
            this.logger.log('✅ Connected to Elasticsearch');
        } catch (error) {
            this.isAvailable = false;
            this.logger.error('❌ Elasticsearch connection failed:', error.message);
        }
    }

    isConnected() {
        return this.isAvailable;
    }

    async search(params: any) {
        if (!this.isAvailable) {
            this.logger.warn('Search skipped: Elasticsearch is not connected.');
            return { hits: { hits: [] } };
        }

        return this.client.search(params);
    }

    async index(params: any) {
        if (!this.isAvailable) {
            this.logger.warn('Index skipped: Elasticsearch is not connected.');
            return;
        }

        return this.client.index(params);
    }

}
