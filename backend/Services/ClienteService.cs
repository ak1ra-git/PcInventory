// ClienteService.cs
using PcInventory.Interfaces;
using PcInventory.Models;

namespace PcInventory.Services
{
    // ClienteService guarda regras de negócio para clientes, como validações de CNPJ, nome e email.
    public class ClienteService : IClienteService
    {
        private readonly IClienteRepository _clienteRepository;

        public ClienteService(IClienteRepository clienteRepository)
        {
            _clienteRepository = clienteRepository;
        }

        public async Task<IEnumerable<Cliente>> ObterTodosAsync()
        {
            return await _clienteRepository.ObterTodosAsync();
        }

        public async Task<Cliente?> ObterPorIdAsync(int id)
        {
            return await _clienteRepository.ObterPorIdAsync(id);
        }

        public async Task<int> AdicionarAsync(Cliente cliente)
        {
            ValidarCliente(cliente);

            cliente.DataCadastro = DateTime.Now;

            return await _clienteRepository.AdicionarAsync(cliente);
        }

        public async Task<bool> AtualizarAsync(Cliente cliente)
        {
            ValidarCliente(cliente);

            return await _clienteRepository.AtualizarAsync(cliente);
        }

        public async Task<bool> DeletarAsync(int id)
        {
            return await _clienteRepository.RemoverAsync(id);
        }

        private void ValidarCliente(Cliente cliente)
        {
            if (string.IsNullOrWhiteSpace(cliente.Nome))
                throw new ArgumentException("O nome do cliente é obrigatório.");

            if (string.IsNullOrWhiteSpace(cliente.CNPJ))
                throw new ArgumentException("O CNPJ é obrigatório.");

            if (cliente.CNPJ.Length != 14)
                throw new ArgumentException("O CNPJ deve conter 14 dígitos.");

            if (string.IsNullOrWhiteSpace(cliente.Email))
                throw new ArgumentException("O e-mail é obrigatório.");
        }
    }
}