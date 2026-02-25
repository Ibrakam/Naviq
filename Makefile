.PHONY: prod-up prod-down prod-restart prod-update prod-logs prod-ps db-export-local db-import-prod db-push-server

prod-up:
	./deploy/up.sh

prod-down:
	./deploy/down.sh

prod-restart:
	docker compose -f docker-compose.prod.yml --env-file deploy/.env down
	docker compose -f docker-compose.prod.yml --env-file deploy/.env up -d --build

prod-update:
	./deploy/update.sh $(BRANCH)

prod-logs:
	docker compose -f docker-compose.prod.yml --env-file deploy/.env logs -f

prod-ps:
	docker compose -f docker-compose.prod.yml --env-file deploy/.env ps

db-export-local:
	./deploy/db-export-local.sh

db-import-prod:
	@test -n "$(DUMP)" || (echo "Usage: make db-import-prod DUMP=deploy/dumps/backup.dump" && exit 1)
	./deploy/db-import-prod.sh "$(DUMP)"

db-push-server:
	@test -n "$(REMOTE)" || (echo "Usage: make db-push-server REMOTE=user@server APP_DIR=/opt/naviq [DUMP=deploy/dumps/backup.dump]" && exit 1)
	@test -n "$(APP_DIR)" || (echo "Usage: make db-push-server REMOTE=user@server APP_DIR=/opt/naviq [DUMP=deploy/dumps/backup.dump]" && exit 1)
	./deploy/db-push-to-server.sh "$(REMOTE)" "$(APP_DIR)" "$(DUMP)"
