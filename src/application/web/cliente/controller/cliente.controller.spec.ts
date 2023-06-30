import { Test, TestingModule } from '@nestjs/testing';
import { ClienteController } from './cliente.controller';
import { SalvarClienteRequest } from '../request/salvar-cliente.request';
import { IClienteService } from 'src/domain/cliente/service/cliente.service.interface';
import { ClienteIdentificado } from 'src/domain/cliente/model/cliente-identificado.model';
import { SalvarClienteResponse } from '../response/salvar-cliente.response';

describe('ClienteController', () => {
   let controller: ClienteController;
   let service: IClienteService;

   // Define um objeto de requisição
   const request: SalvarClienteRequest = {
      nome: 'Teste',
      email: 'teste@teste.com',
      cpf: '25634428777',
   };

   // Define um objeto de cliente esperado como resultado
   const response: SalvarClienteResponse = {
      id: 1,
      nome: 'Teste',
      email: 'teste@teste.com',
      cpf: '25634428777',
   };

   beforeEach(async () => {
      // Configuração do módulo de teste
      const module: TestingModule = await Test.createTestingModule({
         controllers: [ClienteController],
         providers: [
            // Mock do serviço IService<Cliente>
            {
               provide: 'IService<Cliente>',
               useValue: {
                  // Mocka chamada para o save, rejeitando a promise em caso de request undefined
                  save: jest.fn((request) =>
                     request ? Promise.resolve(response) : Promise.reject(new Error('error')),
                  ),
                  findByCpf: jest.fn((cpf) =>
                     cpf === response.cpf ? Promise.resolve(response) : Promise.resolve(undefined),
                  ),
                  identifyByCpf: jest.fn((cpf) =>
                     cpf === response.cpf
                        ? Promise.resolve(response)
                        : Promise.resolve(new ClienteIdentificado(undefined)),
                  ),
               },
            },
         ],
      }).compile();

      // Desabilita a saída de log
      module.useLogger(false);

      // Obtém a instância do controller e do serviço a partir do módulo de teste
      controller = module.get<ClienteController>(ClienteController);
      service = module.get<IClienteService>('IService<Cliente>');
   });

   describe('injeção de dependências', () => {
      it('deve existir instância de serviço definida', async () => {
         // Verifica se a instância de serviço está definida
         expect(service).toBeDefined();
      });
   });

   describe('salvar', () => {
      it('deve salvar um novo cliente', async () => {
         // Chama o método salvar do controller
         const result = await controller.salvar(request);

         // Verifica se o método save do serviço foi chamado corretamente com a requisição
         expect(service.save).toHaveBeenCalledWith(request);

         // Verifica se o resultado obtido é igual ao objeto cliente esperado
         expect(result).toEqual(response);
      });

      it('não deve tratar erro a nível de controlador', async () => {
         const error = new Error('Erro genérico não tratado');
         jest.spyOn(service, 'save').mockRejectedValue(error);

         // Chama o método salvar do controller
         await expect(controller.salvar(request)).rejects.toThrow('Erro genérico não tratado');

         // Verifica se método save foi chamado com o parametro esperado
         expect(service.save).toHaveBeenCalledWith(request);
      });
   });

   describe('buscaPorCpf', () => {
      it('deve buscar cliente por cpf', async () => {
         // Chama o método buscaPorCpf do controller
         const result = await controller.buscaPorCpf({ cpf: request.cpf });

         // Verifica se o método findByCpf do serviço foi chamado corretamente com a requisição
         expect(service.findByCpf).toHaveBeenCalledWith(request.cpf);

         // Verifica se o resultado obtido é igual ao objeto cliente esperado
         expect(result).toEqual(response);
      });

      it('não deve buscar cliente por cpf inexistente', async () => {
         // Chama o método buscaPorCpf do controller
         await controller.buscaPorCpf({ cpf: '123456' }).catch((error) => {
            expect(error.message).toEqual('Cliente não encontrado');
            expect(error.status).toEqual(404);
         });

         // Verifica se o método findByCpf do serviço foi chamado corretamente com a requisição
         expect(service.findByCpf).toHaveBeenCalledWith('123456');
      });
   });

   describe('identificaCliente', () => {
      it('deve identificar cliente por cpf', async () => {
         // Chama o método identificaCliente do controller
         const result = await controller.identificaCliente({ cpf: request.cpf });

         // Verifica se o método findByCpf do serviço foi chamado corretamente com a requisição
         expect(service.identifyByCpf).toHaveBeenCalledWith(request.cpf);

         // Verifica se o resultado obtido é igual ao objeto cliente esperado
         expect(result).toEqual(response);
      });

      it('deve identificar cliente anonimo', async () => {
         // Chama o método identificaCliente do controller
         const result: ClienteIdentificado = await controller.identificaCliente({ cpf: '00000000191' });

         // Verifica se o método findByCpf do serviço foi chamado corretamente com a requisição
         expect(service.identifyByCpf).toHaveBeenCalledWith('00000000191');

         // Verifica se o resultado obtido é igual ao objeto cliente esperado
         expect(result.anonimo).toEqual(true);
      });
   });
});
