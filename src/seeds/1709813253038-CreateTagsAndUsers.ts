import { MigrationInterface, QueryRunner } from "typeorm";

export class Seeds1709813253038 implements MigrationInterface {
    name = 'Seeds1709813253038'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO tags (name) VALUES ('sport'), ('healthyfood'), ('football')`,
        );

        // password yurii
        await queryRunner.query(`
            INSERT INTO users (username, email, password ) VALUES ('yurii', 'yurii@gmail.com', '$2b$10$46l0lhVULcczPhTGVsBG8uOGrsmWLvoVR/obKouhvjGXMJWzeQdU6')`,
        );

        // password test
        await queryRunner.query(`
            INSERT INTO users (username, email, password ) VALUES ('test', 'test@gmail.com', '$2b$10$GwOvQUz.hjK8wauKVNp6deIU6ABOZps.eldwKYnJuriQkUGaFlIuW')`,
        );

        await queryRunner.query(`
            INSERT INTO articles (slug, title, description, body, "tagList", "authorId" ) VALUES ('movies', 'Movies', 'Best Movies of all Time', 'article body', 'bestMovies,movies,bestsellers',  1)`,
        );

        await queryRunner.query(`
            INSERT INTO articles (slug, title, description, body, "tagList", "authorId" ) VALUES ('movies2', 'Movies2', 'Time2', 'article body', 'bestMovies,movies,bestsellers',  1)`,
        );
    }

    public async down(): Promise<void> {}

}
