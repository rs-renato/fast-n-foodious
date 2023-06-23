import { Module } from '@nestjs/common';
import { Cliente } from './cliente/model/cliente.model';
import { ClienteService } from './cliente/service/cliente.service';
import { IRepository } from './repository/repository';
import { CpfUnicoClienteValidator } from './cliente/validation/cpf-unico-cliente.validator';
import { EmailUnicoClienteValidator } from './cliente/validation/email-unico-cliente.validator';
import { SalvarClienteValidator } from './cliente/validation/salvar-cliente.validator';
import { ProdutoService } from './produto/service/produto.service';
import { Produto } from './produto/model/produto.model';
import { SalvarProdutoValidator } from './produto/validation/salvar-produto.validator';
import { CamposObrigatoriosProdutoValidator } from './produto/validation/campos-obrigatorios-produto.validator';
import { BuscarClienteValidator } from './cliente/validation/buscar-cliente.validator';
import { CpfValidoClienteValidator } from './cliente/validation/cpf-valido-cliente.validator';
import { EmailValidoClienteValidator } from './cliente/validation/email-valido-cliente.validator.';

@Module({
   providers: [
      { provide: 'IService<Cliente>', useClass: ClienteService },
      {
         provide: 'SalvarClienteValidator',
         inject: ['IRepository<Cliente>'],
         useFactory: (repository: IRepository<Cliente>): SalvarClienteValidator[] => [
            new CpfValidoClienteValidator(),
            new EmailValidoClienteValidator(),
            new EmailUnicoClienteValidator(repository),
            new CpfUnicoClienteValidator(repository),
         ],
      },

      { provide: 'IService<Produto>', useClass: ProdutoService },
      {
         provide: 'SalvarProdutoValidator',
         inject: ['IRepository<Produto>'],
         useFactory: (repository: IRepository<Produto>): SalvarProdutoValidator[] => [
            new CamposObrigatoriosProdutoValidator(repository),
         ],
      },
      {
         provide: 'BuscarClienteValidator',
         useFactory: (): BuscarClienteValidator[] => [new CpfValidoClienteValidator()],
      },
   ],
   exports: [
      { provide: 'IService<Cliente>', useClass: ClienteService },
      { provide: 'IService<Produto>', useClass: ProdutoService },
   ],
})
export class DomainModule {}
