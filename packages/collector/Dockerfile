FROM grafana/alloy:latest

# Set working directory
WORKDIR /etc/alloy

# Create directory for config
RUN mkdir -p /etc/alloy

# Copy config file
COPY config.alloy /etc/alloy/config.alloy

# Create entrypoint script
RUN echo '#!/bin/sh\n\
exec alloy run --server.http.listen-addr=0.0.0.0:12345 --storage.path=/var/lib/alloy/data /etc/alloy/config.alloy' > /entrypoint.sh && \
chmod +x /entrypoint.sh

# Create directory for data persistence
RUN mkdir -p /var/lib/alloy/data

# Expose ports
EXPOSE 12345 4317 4318

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"] 



