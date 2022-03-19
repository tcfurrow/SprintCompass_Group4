using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SprintCompassBackend.DataAccessLayer;

namespace SprintCompassBackend
{
    public class Startup
    {
        public IConfiguration Configuration { get; }
        public string ConnectionStringName { get; } = "Development";
        public string ClientDevelopmentEndpoint { get; } = "http://localhost:3000";
        public string CorsPolicyName { get; } = "_corsDevelopment";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options => options.AddPolicy(CorsPolicyName, builder => builder.WithOrigins(ClientDevelopmentEndpoint).AllowAnyHeader().AllowAnyMethod()));
            services.AddControllers();
            services.Add(new ServiceDescriptor(typeof(DatabaseConnectionContext), new DatabaseConnectionContext(Configuration.GetConnectionString(ConnectionStringName))));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseCors(CorsPolicyName);
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
